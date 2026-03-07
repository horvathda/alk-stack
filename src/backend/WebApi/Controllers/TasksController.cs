using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Repositories;
using WebApi.Requests;

namespace WebApi.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly TaskRepository _repo;

    public TasksController(TaskRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? q = null,
        [FromQuery] bool? completed = null)
    {
        var (items, total, pendingCount, completedCount) =
            await _repo.GetPagedAsync(page, pageSize, q, completed);

        return Ok(new
        {
            items,
            total,
            pendingCount,
            completedCount,
            page,
            pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var item = await _repo.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskCreateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("Title is required.");

        var item = new TaskItem
        {
            Title = req.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            Completed = false
        };

        await _repo.CreateAsync(item);
        return Created($"/api/tasks/{item.Id}", item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] TaskUpdateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("Title is required.");

        var existing = await _repo.GetByIdAsync(id);
        if (existing is null)
            return NotFound();

        existing.Title = req.Title.Trim();
        existing.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        existing.Completed = req.Completed;

        var updated = await _repo.UpdateAsync(id, existing);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}