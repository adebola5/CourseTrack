
namespace CourseTrack.API.Models;

public class Resource
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = "Video";

    //identifies the course this resource belongs to
    public int CourseId { get; set; }
    public Course? Course { get; set; }
}
