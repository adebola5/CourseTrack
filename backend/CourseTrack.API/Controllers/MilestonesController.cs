
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CourseTrack.API.Data;
using CourseTrack.API.Models;
using CourseTrack.API.DTOs;

namespace CourseTrack.API.Controllers;

[Route("api/courses/{courseId}/milestones")]
[ApiController]
[Authorize]
public class MilestonesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MilestonesController(ApplicationDbContext context)
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

    //gets all milestones belonging to a course
    [HttpGet]
    public async Task<IActionResult> GetMilestones(int courseId)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var milestones = await _context.Milestones
            .Where(m => m.CourseId == courseId)
            .Select(m => new MilestoneResponseDto
            {
                Id = m.Id,
                Title = m.Title,
                Completed = m.Completed
            })
            .ToListAsync();

        return Ok(milestones);
    }

    //creates a milestone for a course
    [HttpPost]
    public async Task<IActionResult> CreateMilestone(
        int courseId,
        MilestoneRequestDto milestoneDto)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var milestone = new Milestone
        {
            Title = milestoneDto.Title,
            Completed = milestoneDto.Completed,
            CourseId = courseId
        };

        _context.Milestones.Add(milestone);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetMilestones),
            new { courseId },
            new MilestoneResponseDto
            {
                Id = milestone.Id,
                Title = milestone.Title,
                Completed = milestone.Completed
            }
        );
    }

    //updates a milestone belonging to a course
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMilestone(
        int courseId,
        int id,
        MilestoneRequestDto milestoneDto)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var milestone = await _context.Milestones
            .FirstOrDefaultAsync(m =>
                m.Id == id && m.CourseId == courseId);

        if (milestone == null)
        {
            return NotFound(new { message = "Milestone not found" });
        }

        milestone.Title = milestoneDto.Title;
        milestone.Completed = milestoneDto.Completed;

        await _context.SaveChangesAsync();

        return Ok(new MilestoneResponseDto
        {
            Id = milestone.Id,
            Title = milestone.Title,
            Completed = milestone.Completed
        });
    }

    //deletes a milestone belonging to a course
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMilestone(
        int courseId,
        int id)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var milestone = await _context.Milestones
            .FirstOrDefaultAsync(m =>
                m.Id == id && m.CourseId == courseId);

        if (milestone == null)
        {
            return NotFound(new { message = "Milestone not found" });
        }

        _context.Milestones.Remove(milestone);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Milestone deleted successfully" });
    }
}
