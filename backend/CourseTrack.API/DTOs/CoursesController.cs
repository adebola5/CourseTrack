
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CourseTrack.API.Data;
using CourseTrack.API.Models;
using CourseTrack.API.DTOs;

namespace CourseTrack.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CoursesController(ApplicationDbContext context)
    {
        _context = context;
    }

    //gets the id of the currently logged-in user
    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    }

    //gets all courses belonging to the logged-in user
    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        var userId = GetUserId();

        var courses = await _context.Courses
            .Where(c => c.UserId == userId)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Category = c.Category,
                Status = c.Status,
                Progress = c.Progress
            })
            .ToListAsync();

        return Ok(courses);
    }

    //gets a specific course belonging to the logged-in user
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourse(int id)
    {
        var userId = GetUserId();

        var course = await _context.Courses
            .Where(c => c.Id == id && c.UserId == userId)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Category = c.Category,
                Status = c.Status,
                Progress = c.Progress
            })
            .FirstOrDefaultAsync();

        if (course == null)
        {
            return NotFound(new { message = "Course not found" });
        }

        return Ok(course);
    }

    //creates a new course for the logged-in user
    [HttpPost]
    public async Task<IActionResult> CreateCourse(CourseRequestDto courseDto)
    {
        var course = new Course
        {
            Title = courseDto.Title,
            Category = courseDto.Category,
            Status = courseDto.Status,
            Progress = courseDto.Progress,

            //assigns the course to the logged-in user
            UserId = GetUserId()
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCourse),
            new { id = course.Id },
            new CourseResponseDto
            {
                Id = course.Id,
                Title = course.Title,
                Category = course.Category,
                Status = course.Status,
                Progress = course.Progress
            }
        );
    }

    //updates a course belonging to the logged-in user
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(
        int id,
        CourseRequestDto courseDto)
    {
        var userId = GetUserId();

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (course == null)
        {
            return NotFound(new { message = "Course not found" });
        }

        course.Title = courseDto.Title;
        course.Category = courseDto.Category;
        course.Status = courseDto.Status;
        course.Progress = courseDto.Progress;

        await _context.SaveChangesAsync();

        return Ok(new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Category = course.Category,
            Status = course.Status,
            Progress = course.Progress
        });
    }

    //deletes a course belonging to the logged-in user
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var userId = GetUserId();

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (course == null)
        {
            return NotFound(new { message = "Course not found" });
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Course deleted successfully" });
    }
}
