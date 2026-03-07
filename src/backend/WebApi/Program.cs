using MongoDB.Driver;
using WebApi.Data;
using WebApi.Models;
using WebApi.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<MongoContext>();
builder.Services.AddSingleton<TaskRepository>();

// .NET 10 template OpenAPI (nem Swagger)
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<MongoContext>();

    var hasAnyTask = await ctx.Tasks.Find(Builders<TaskItem>.Filter.Empty).AnyAsync();

    if (!hasAnyTask)
    {
        var now = DateTime.UtcNow;

        var seedTasks = new List<TaskItem>
        {
            new TaskItem
            {
                Title = "Frontend",
                Description = "Angular felület véglegesítése, pagination és statisztikák ellenőrzése",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "Backend",
                Description = "ASP.NET API ellenőrzése, lapozás és összesítő darabszámok visszaadása",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "MongoDB",
                Description = "Adatbázis kapcsolat ellenőrzése és seed adatok betöltése",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "Docker",
                Description = "docker compose build és futtatás tesztelése",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "Kubernetes",
                Description = "Deployment, service és ingress ellenőrzése Docker Desktop Kubernetes környezetben",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "Helm",
                Description = "Helm chart telepítés és values konfiguráció véglegesítése",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "CI/CD",
                Description = "GitHub Actions workflow és GHCR image build/push ellenőrzése",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "README",
                Description = "Felhasználói útmutató és telepítési leírás frissítése a jelenlegi projekthez",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem

            {
                Title = "Feladat beadása",
                Description = "",
                Completed = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TaskItem
            {
                Title = "Pitch videó elkészítése",
                Description = "",
                Completed = false,
                CreatedAt = now,
                UpdatedAt = now
            },



        };

        await ctx.Tasks.InsertManyAsync(seedTasks);
    }
}

app.Run();