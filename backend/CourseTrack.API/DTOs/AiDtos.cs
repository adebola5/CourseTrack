namespace CourseTrack.API.DTOs;

public class CreateAiMessageDto
{
    public string Content { get; set; } = string.Empty;
}

public record AiConversationDto(
    Guid Id,
    string Title,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public record AiMessageDto(
    Guid Id,
    string Role,
    string Content,
    DateTime CreatedAtUtc);

public record AiUsageDto(
    int Used,
    int DailyLimit,
    int Remaining,
    DateOnly UsageDate);
