namespace CourseTrack.API.DTOs;

public class RegisterDto
{
    //these are the attributes needed to create a user account
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}