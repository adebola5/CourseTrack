
namespace CourseTrack.API.Models;

public class Milestone
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public bool Completed { get; set; }

    //identifies the course this milestone belongs to
    public int CourseId { get; set; }
    public Course? Course { get; set; }
}
