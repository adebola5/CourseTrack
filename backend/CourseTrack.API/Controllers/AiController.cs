using System.Security.Claims;
using CourseTrack.API.Data;
using CourseTrack.API.DTOs;
using CourseTrack.API.Models;
using CourseTrack.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CourseTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private const int MaxMessageLength = 3000;
    private const int ConversationContextLimit = 12;

    private readonly ApplicationDbContext _context;
    private readonly CloudflareAiService _aiService;
    private readonly CloudflareAiOptions _aiOptions;
    private readonly ILogger<AiController> _logger;

    public AiController(
        ApplicationDbContext context,
        CloudflareAiService aiService,
        IOptions<CloudflareAiOptions> aiOptions,
        ILogger<AiController> logger)
    {
        _context = context;
        _aiService = aiService;
        _aiOptions = aiOptions.Value;
        _logger = logger;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null) return Unauthorized();

        var conversations = await _context.AiConversations
            .AsNoTracking()
            .Where(conversation => conversation.UserId == userId)
            .OrderByDescending(conversation => conversation.UpdatedAtUtc)
            .Select(conversation => new AiConversationDto(
                conversation.Id,
                conversation.Title,
                conversation.CreatedAtUtc,
                conversation.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return Ok(conversations);
    }

    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null) return Unauthorized();

        var conversation = new AiConversation { UserId = userId };
        _context.AiConversations.Add(conversation);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new AiConversationDto(
            conversation.Id,
            conversation.Title,
            conversation.CreatedAtUtc,
            conversation.UpdatedAtUtc));
    }

    [HttpGet("conversations/{conversationId:guid}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null) return Unauthorized();

        var ownsConversation = await _context.AiConversations
            .AnyAsync(conversation => conversation.Id == conversationId && conversation.UserId == userId, cancellationToken);

        if (!ownsConversation) return NotFound(new { message = "Conversation not found." });

        var messages = await _context.AiMessages
            .AsNoTracking()
            .Where(message => message.ConversationId == conversationId)
            .OrderBy(message => message.CreatedAtUtc)
            .Select(message => new AiMessageDto(
                message.Id,
                message.Role,
                message.Content,
                message.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Ok(messages);
    }

    [HttpPost("conversations/{conversationId:guid}/messages")]
    public async Task<IActionResult> SendMessage(
        Guid conversationId,
        [FromBody] CreateAiMessageDto request,
        CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null) return Unauthorized();

        var content = request.Content?.Trim();
        if (string.IsNullOrWhiteSpace(content))
            return BadRequest(new { message = "Please enter a message." });

        if (content.Length > MaxMessageLength)
            return BadRequest(new { message = $"Messages must be {MaxMessageLength} characters or fewer." });

        var conversation = await _context.AiConversations
            .FirstOrDefaultAsync(item => item.Id == conversationId && item.UserId == userId, cancellationToken);

        if (conversation is null)
            return NotFound(new { message = "Conversation not found." });

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var usage = await _context.AiUsageRecords
            .FirstOrDefaultAsync(item => item.UserId == userId && item.UsageDate == today, cancellationToken);

        if (usage is null)
        {
            usage = new AiUsageRecord { UserId = userId, UsageDate = today, RequestCount = 0 };
            _context.AiUsageRecords.Add(usage);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var dailyLimit = Math.Max(1, _aiOptions.DailyRequestLimit);
        if (usage.RequestCount >= dailyLimit)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                message = "You've reached your daily AI request limit. Please try again tomorrow.",
                usage = new AiUsageDto(usage.RequestCount, dailyLimit, 0, today)
            });
        }

        // Count the request before calling the provider so repeated failures cannot be used to bypass the limit.
        usage.RequestCount++;
        conversation.UpdatedAtUtc = DateTime.UtcNow;

        var previousMessages = await _context.AiMessages
            .Where(message => message.ConversationId == conversationId)
            .OrderByDescending(message => message.CreatedAtUtc)
            .Take(ConversationContextLimit)
            .OrderBy(message => message.CreatedAtUtc)
            .Select(message => new AiChatMessage(message.Role, message.Content))
            .ToListAsync(cancellationToken);

        var userMessage = new AiMessage
        {
            ConversationId = conversationId,
            Role = "user",
            Content = content
        };

        _context.AiMessages.Add(userMessage);
        if (previousMessages.Count == 0)
        {
            conversation.Title = content.Length > 55 ? content[..55].TrimEnd() + "…" : content;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var modelMessages = new List<AiChatMessage>
        {
            new("system", "You are CourseTrack's academic assistant. Help students understand concepts, plan their learning, revise topics, and work through problems step by step. Be encouraging, clear, and concise. Do not claim to access the student's CourseTrack data unless it is included in the conversation. When helping with assignments, explain the reasoning and support learning rather than simply encouraging plagiarism.")
        };
        modelMessages.AddRange(previousMessages);
        modelMessages.Add(new AiChatMessage("user", content));

        string answer = string.Empty;
        try
        {
            answer = await _aiService.GetResponseAsync(modelMessages, cancellationToken);
        }
        catch (CloudflareAiException exception)
        {
            _logger.LogWarning(
                "Cloudflare Workers AI request failed. Status: {StatusCode}. Provider response: {ProviderResponse}",
                exception.StatusCode,
                exception.ProviderResponse);

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "The AI provider could not complete the request. Please try again later."
            });
        }
        catch (InvalidOperationException exception)
        {
            _logger.LogError(exception, "Cloudflare AI is not configured correctly.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "The AI assistant is not configured yet. Please contact the application administrator."
            });
        }
        catch (HttpRequestException exception)
        {
            _logger.LogWarning(exception, "Could not reach Cloudflare Workers AI.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "The AI service could not be reached. Please try again later."
            });
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return StatusCode(StatusCodes.Status504GatewayTimeout, new
            {
                message = "The AI assistant took too long to respond. Please try again."
            });
        }

        var assistantMessage = new AiMessage
        {
            ConversationId = conversationId,
            Role = "assistant",
            Content = answer
        };

        _context.AiMessages.Add(assistantMessage);
        conversation.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            conversation = new AiConversationDto(
                conversation.Id,
                conversation.Title,
                conversation.CreatedAtUtc,
                conversation.UpdatedAtUtc),
            userMessage = new AiMessageDto(
                userMessage.Id,
                userMessage.Role,
                userMessage.Content,
                userMessage.CreatedAtUtc),
            assistantMessage = new AiMessageDto(
                assistantMessage.Id,
                assistantMessage.Role,
                assistantMessage.Content,
                assistantMessage.CreatedAtUtc),
            usage = new AiUsageDto(
                usage.RequestCount,
                dailyLimit,
                Math.Max(0, dailyLimit - usage.RequestCount),
                today)
        });
    }

    [HttpGet("usage")]
    public async Task<IActionResult> GetUsage(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null) return Unauthorized();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var usage = await _context.AiUsageRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId && item.UsageDate == today, cancellationToken);

        var used = usage?.RequestCount ?? 0;
        var limit = Math.Max(1, _aiOptions.DailyRequestLimit);

        return Ok(new AiUsageDto(used, limit, Math.Max(0, limit - used), today));
    }

    [HttpDelete("conversations/{conversationId:guid}")]
    public async Task<IActionResult> DeleteConversation(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null) return Unauthorized();

        var conversation = await _context.AiConversations
            .FirstOrDefaultAsync(item => item.Id == conversationId && item.UserId == userId, cancellationToken);

        if (conversation is null) return NotFound(new { message = "Conversation not found." });

        _context.AiConversations.Remove(conversation);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
