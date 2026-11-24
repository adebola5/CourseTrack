namespace CourseTrack.API.Models;

public class AiUsageRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public DateOnly UsageDate { get; set; }
    public int RequestCount { get; set; }
}
