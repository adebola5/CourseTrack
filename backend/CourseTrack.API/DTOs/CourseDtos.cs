
using System.ComponentModel.DataAnnotations;

namespace CourseTrack.API.DTOs;

//contains the information needed to create or update a course
public class CourseRequestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Status { get; set; } = string.Empty;

    [Range(0, 100)]
    public int Progress { get; set; }
}

//contains the course information returned by the api
public class CourseResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Progress { get; set; }
}
