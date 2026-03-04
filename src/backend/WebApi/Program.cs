var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSingleton<WebApi.Data.MongoContext>();
builder.Services.AddSingleton<WebApi.Repositories.TaskRepository>();

// .NET 10 template OpenAPI (nem Swagger)
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();

app.MapControllers();

app.Run();
