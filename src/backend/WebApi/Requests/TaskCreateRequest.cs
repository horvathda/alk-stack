namespace WebApi.Requests;

public class TaskCreateRequest
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
}
