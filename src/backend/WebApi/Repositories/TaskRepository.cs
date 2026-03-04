using MongoDB.Bson;
using MongoDB.Driver;
using WebApi.Data;
using WebApi.Models;

namespace WebApi.Repositories;

public class TaskRepository
{
    private readonly IMongoCollection<TaskItem> _tasks;

    public TaskRepository(MongoContext ctx)
    {
        _tasks = ctx.Tasks;
    }

    public async Task<(List<TaskItem> Items, long Total)> GetPagedAsync(int page, int pageSize, string? q, bool? completed)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var filters = new List<FilterDefinition<TaskItem>> { Builders<TaskItem>.Filter.Empty };

        if (!string.IsNullOrWhiteSpace(q))
        {
            var re = new BsonRegularExpression(q, "i");
            var f1 = Builders<TaskItem>.Filter.Regex(x => x.Title, re);
            var f2 = Builders<TaskItem>.Filter.Regex(x => x.Description, re);
            filters.Add(Builders<TaskItem>.Filter.Or(f1, f2));
        }

        if (completed.HasValue)
        {
            filters.Add(Builders<TaskItem>.Filter.Eq(x => x.Completed, completed.Value));
        }

        var filter = Builders<TaskItem>.Filter.And(filters);

        var total = await _tasks.CountDocumentsAsync(filter);

        var items = await _tasks.Find(filter)
            .SortByDescending(x => x.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public Task<TaskItem?> GetByIdAsync(string id) =>
        _tasks.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<TaskItem> CreateAsync(TaskItem item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        await _tasks.InsertOneAsync(item);
        return item;
    }

    public async Task<TaskItem?> UpdateAsync(string id, TaskItem updated)
    {
        updated.Id = id;
        updated.UpdatedAt = DateTime.UtcNow;

        var result = await _tasks.ReplaceOneAsync(x => x.Id == id, updated);
        return result.MatchedCount == 0 ? null : updated;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _tasks.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}
