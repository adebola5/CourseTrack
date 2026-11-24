
namespace CourseTrack.API.Models;

public class StudySession
{
    public int Id { get; set; }

    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public int Duration { get; set; }
    public string Description { get; set; } = string.Empty;

    //identifies the course this study session belongs to
    public int CourseId { get; set; }
    public Course? Course { get; set; }
}
