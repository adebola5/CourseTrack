
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace CourseTrack.API.Services;

public record AiChatMessage(string Role, string Content);

public class CloudflareAiService
{
    private readonly HttpClient _httpClient;
    private readonly CloudflareAiOptions _options;

    public CloudflareAiService(
        HttpClient httpClient,
        IOptions<CloudflareAiOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<string> GetResponseAsync(
        IReadOnlyCollection<AiChatMessage> messages,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.AccountId) ||
            string.IsNullOrWhiteSpace(_options.ApiToken))
        {
            throw new InvalidOperationException(
                "Cloudflare AI credentials are not configured on the server.");
        }

        var endpoint =
            $"https://api.cloudflare.com/client/v4/accounts/{_options.AccountId}/ai/run/{_options.Model}";

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", _options.ApiToken);

        request.Content = JsonContent.Create(new
        {
            messages,
            max_tokens = 700,
            options = new { rejectIfBusy = true },
            chat_template_kwargs = new { enable_thinking = false }
        });

        using var response = await _httpClient.SendAsync(
            request, cancellationToken);

        var responseBody = await response.Content.ReadAsStringAsync(
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new CloudflareAiException(
                (int)response.StatusCode, responseBody);
        }

        try
        {
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;

            if (root.TryGetProperty("success", out var success) &&
                success.ValueKind == JsonValueKind.False)
            {
                throw new CloudflareAiException(
                    (int)response.StatusCode, responseBody);
            }

            // Cloudflare Workers AI response format
            if (root.TryGetProperty("result", out var result))
            {
                if (result.ValueKind == JsonValueKind.Object &&
                    result.TryGetProperty("response", out var generatedResponse) &&
                    generatedResponse.ValueKind == JsonValueKind.String)
                {
                    var generatedText = generatedResponse.GetString();

                    if (!string.IsNullOrWhiteSpace(generatedText))
                    {
                        return generatedText.Trim();
                    }
                }

                // Also check the OpenAI-compatible choices format
                if (TryGetMessageContent(result, out var resultText))
                {
                    return resultText;
                }
            }

            // Check choices at the root level as well
            if (TryGetMessageContent(root, out var rootText))
            {
                return rootText;
            }
        }
        catch (JsonException)
        {
            throw new CloudflareAiException(
                (int)response.StatusCode,
                $"The AI provider returned invalid JSON: {responseBody}");
        }

        throw new CloudflareAiException(
            (int)response.StatusCode,
            $"The AI provider response did not contain generated text: {responseBody}");
    }

    private static bool TryGetMessageContent(
        JsonElement element,
        out string content)
    {
        content = string.Empty;

        if (element.ValueKind != JsonValueKind.Object ||
            !element.TryGetProperty("choices", out var choices) ||
            choices.ValueKind != JsonValueKind.Array ||
            choices.GetArrayLength() == 0)
        {
            return false;
        }

        var firstChoice = choices[0];

        if (!firstChoice.TryGetProperty("message", out var message) ||
            !message.TryGetProperty("content", out var messageContent) ||
            messageContent.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        var text = messageContent.GetString();

        if (string.IsNullOrWhiteSpace(text))
        {
            return false;
        }

        content = text.Trim();
        return true;
    }
}

public class CloudflareAiException : Exception
{
    public int StatusCode { get; }
    public string ProviderResponse { get; }

    public CloudflareAiException(int statusCode, string providerResponse)
        : base("The AI provider could not complete the request.")
    {
        StatusCode = statusCode;
        ProviderResponse = providerResponse;
    }
}
