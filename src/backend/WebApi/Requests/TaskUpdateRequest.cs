namespace WebApi.Requests;

public class TaskUpdateRequest
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool Completed { get; set; }
}
