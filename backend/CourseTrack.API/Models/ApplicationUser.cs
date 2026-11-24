
using Microsoft.AspNetCore.Identity;

namespace CourseTrack.API.Models;

//the identityUser here already provides properties such as Id, Email, UserName and PasswordHash. We don't need to create those ourselves.
public class ApplicationUser : IdentityUser
{
    //stores the courses belonging to this user, its in list form because 1 user can have many courses
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
