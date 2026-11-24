namespace CourseTrack.API.Services;

public class CloudflareAiOptions
{
    public string AccountId { get; set; } = string.Empty;
    public string ApiToken { get; set; } = string.Empty;
    public string Model { get; set; } = "@cf/google/gemma-4-26b-a4b-it";
    public int DailyRequestLimit { get; set; } = 10;
}
