import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TaskItem {
  id?: string;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedTasks {
  items: TaskItem[];
  total: number;
  page: number;
  pageSize: number;
}

export class TaskApi {
  private http = inject(HttpClient);
  private api = '/api/tasks';

  getTasks(page: number = 1, pageSize: number = 10) {
    return this.http.get<PagedTasks>(`${this.api}?page=${page}&pageSize=${pageSize}`);
  }

  createTask(payload: { title: string; description?: string | null }) {
    return this.http.post<TaskItem>(this.api, payload);
  }

  updateTask(id: string, payload: { title: string; description?: string | null; completed: boolean }) {
    return this.http.put<TaskItem>(`${this.api}/${id}`, payload);
  }

  deleteTask(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
