
using System.ComponentModel.DataAnnotations;

namespace CourseTrack.API.DTOs;

//contains the information needed to create or update a resource
public class ResourceRequestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Url { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty;
}

//contains the resource information returned by the api
public class ResourceResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
