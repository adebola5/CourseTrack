
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CourseTrack.API.Data;
using CourseTrack.API.Models;
using CourseTrack.API.DTOs;

namespace CourseTrack.API.Controllers;

[Route("api/courses/{courseId}/resources")]
[ApiController]
[Authorize]
public class ResourcesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ResourcesController(ApplicationDbContext context)
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

    //gets all resources belonging to a course
    [HttpGet]
    public async Task<IActionResult> GetResources(int courseId)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var resources = await _context.Resources
            .Where(r => r.CourseId == courseId)
            .Select(r => new ResourceResponseDto
            {
                Id = r.Id,
                Title = r.Title,
                Url = r.Url,
                Type = r.Type
            })
            .ToListAsync();

        return Ok(resources);
    }

    //creates a resource for a course
    [HttpPost]
    public async Task<IActionResult> CreateResource(
        int courseId,
        ResourceRequestDto resourceDto)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var resource = new Resource
        {
            Title = resourceDto.Title,
            Url = resourceDto.Url,
            Type = resourceDto.Type,
            CourseId = courseId
        };

        _context.Resources.Add(resource);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetResources),
            new { courseId },
            new ResourceResponseDto
            {
                Id = resource.Id,
                Title = resource.Title,
                Url = resource.Url,
                Type = resource.Type
            }
        );
    }

    //updates a resource belonging to a course
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateResource(
        int courseId,
        int id,
        ResourceRequestDto resourceDto)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var resource = await _context.Resources
            .FirstOrDefaultAsync(r =>
                r.Id == id && r.CourseId == courseId);

        if (resource == null)
        {
            return NotFound(new { message = "Resource not found" });
        }

        resource.Title = resourceDto.Title;
        resource.Url = resourceDto.Url;
        resource.Type = resourceDto.Type;

        await _context.SaveChangesAsync();

        return Ok(new ResourceResponseDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Url = resource.Url,
            Type = resource.Type
        });
    }

    //deletes a resource belonging to a course
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteResource(
        int courseId,
        int id)
    {
        if (!await CourseBelongsToUser(courseId))
        {
            return NotFound(new { message = "Course not found" });
        }

        var resource = await _context.Resources
            .FirstOrDefaultAsync(r =>
                r.Id == id && r.CourseId == courseId);

        if (resource == null)
        {
            return NotFound(new { message = "Resource not found" });
        }

        _context.Resources.Remove(resource);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Resource deleted successfully" });
    }
}
