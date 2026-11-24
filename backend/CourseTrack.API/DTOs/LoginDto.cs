namespace CourseTrack.API.DTOs;

public class LoginDto
{
    //attributes needed to log in to the system
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}