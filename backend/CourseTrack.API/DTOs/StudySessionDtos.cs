
using System.ComponentModel.DataAnnotations;

//contains the information needed to create or update a study session
namespace CourseTrack.API.DTOs;

public class StudySessionRequestDto
{
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public int Duration { get; set; }
    public string Description { get; set; } = string.Empty;
}

//contains the study session information returned by the api
public class StudySessionResponseDto
{
    public int Id { get; set; }

    //identifies the course that owns this study session
    public int CourseId { get; set; }

    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public int Duration { get; set; }
    public string Description { get; set; } = string.Empty;
}
