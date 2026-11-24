
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CourseTrack.API.Data;
using CourseTrack.API.Models;
using CourseTrack.API.DTOs;

namespace CourseTrack.API.Controllers;

[Route("api/courses/{courseId}/study-sessions")]
[ApiController]
[Authorize]
public class StudySessionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StudySessionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    //gets the id of the currently logged-in user
    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    }

    //checks whether the course belongs to the logged-in user
    private async Task<bool> CourseBelongsToUser(int courseId)
    {
        var userId = GetUserId();

        return await _context.Courses
            .AnyAsync(c => c.Id == courseId && c.UserId == userId);
    }

    //gets all study sessions belonging to a course
    [HttpGet]
    public async Task<IActionResult> GetStudySessions(int courseId)
    {
        if (!await CourseBelongsToUser(courseId))
            return NotFound(new { message = "Course not found" });

        var sessions = await _context.StudySessions
            .Where(s => s.CourseId == courseId)
            .Select(s => new StudySessionResponseDto
            {
                Id = s.Id,

                //returns the course id along with the session
                CourseId = s.CourseId,

                Date = s.Date,
                StartTime = s.StartTime,
                Duration = s.Duration,
                Description = s.Description
            })
            .ToListAsync();

        return Ok(sessions);
    }

    //creates a new study session for a course
    [HttpPost]
    public async Task<IActionResult> CreateStudySession(
        int courseId,
        StudySessionRequestDto sessionDto)
    {
        if (!await CourseBelongsToUser(courseId))
            return NotFound(new { message = "Course not found" });

        var session = new StudySession
        {
            Date = sessionDto.Date,
            StartTime = sessionDto.StartTime,
            Duration = sessionDto.Duration,
            Description = sessionDto.Description,
            CourseId = courseId
        };

        _context.StudySessions.Add(session);
        await _context.SaveChangesAsync();

        var response = new StudySessionResponseDto
        {
            Id = session.Id,

            //returns the course id of the newly created session
            CourseId = session.CourseId,

            Date = session.Date,
            StartTime = session.StartTime,
            Duration = session.Duration,
            Description = session.Description
        };

        return CreatedAtAction(
            nameof(GetStudySessions),
            new { courseId },
            response
        );
    }

    //updates a study session belonging to a course
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStudySession(
        int courseId,
        int id,
        StudySessionRequestDto sessionDto)
    {
        if (!await CourseBelongsToUser(courseId))
            return NotFound(new { message = "Course not found" });

        var session = await _context.StudySessions
            .FirstOrDefaultAsync(s => s.Id == id && s.CourseId == courseId);

        if (session == null)
            return NotFound(new { message = "Study session not found" });

        session.Date = sessionDto.Date;
        session.StartTime = sessionDto.StartTime;
        session.Duration = sessionDto.Duration;
        session.Description = sessionDto.Description;

        await _context.SaveChangesAsync();

        return Ok(new StudySessionResponseDto
        {
            Id = session.Id,

            //returns the course id along with the updated session
            CourseId = session.CourseId,

            Date = session.Date,
            StartTime = session.StartTime,
            Duration = session.Duration,
            Description = session.Description
        });
    }

    //deletes a study session belonging to a course
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudySession(int courseId, int id)
    {
        if (!await CourseBelongsToUser(courseId))
            return NotFound(new { message = "Course not found" });

        var session = await _context.StudySessions
            .FirstOrDefaultAsync(s => s.Id == id && s.CourseId == courseId);

        if (session == null)
            return NotFound(new { message = "Study session not found" });

        _context.StudySessions.Remove(session);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Study session deleted successfully" });
    }
}
