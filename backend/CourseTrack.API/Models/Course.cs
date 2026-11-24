
namespace CourseTrack.API.Models;

public class Course
{
    //declare all the properties for this class, each prop represents a column in this table
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = "Planned";
    public int Progress { get; set; }

    //identifies the user who owns this course
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    //stores the milestones and resources belonging to this course
    //they are in list form because each user can have multiple also they have their own tables
    public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
    public ICollection<Resource> Resources { get; set; } = new List<Resource>();

    //stores the study sessions linked to this course
    public ICollection<StudySession> StudySessions { get; set; } = new List<StudySession>();
}
