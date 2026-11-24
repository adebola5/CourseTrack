using System.ComponentModel.DataAnnotations;

namespace CourseTrack.API.DTOs;

//We don't include CourseId in the request body because we'll obtain it from the course URL and verify ownership on the backend.

//contains the information needed to create or update a milestone
public class MilestoneRequestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public bool Completed { get; set; }
}

//contains the milestone information returned by the api
public class MilestoneResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool Completed { get; set; }
}