using MongoDB.Driver;
using WebApi.Models;

namespace WebApi.Data;

public class MongoContext
{
    public IMongoCollection<TaskItem> Tasks { get; }

    public MongoContext(IConfiguration config)
    {
        var mongoUrl = config["MONGO_URL"];
        if (string.IsNullOrWhiteSpace(mongoUrl))
            throw new InvalidOperationException("MONGO_URL is not configured.");

        var url = new MongoUrl(mongoUrl);
        var client = new MongoClient(url);

        var dbName = url.DatabaseName ?? "tasks";
        var db = client.GetDatabase(dbName);

        Tasks = db.GetCollection<TaskItem>("tasks");
    }
}
