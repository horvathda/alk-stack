import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  pendingCount: number;
  completedCount: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private http = inject(HttpClient);
  private api = '/api/tasks';

  getTasks(page: number = 1, pageSize: number = 10): Observable<PagedTasks> {
    return this.http.get<PagedTasks>(`${this.api}?page=${page}&pageSize=${pageSize}`);
  }

  createTask(payload: { title: string; description?: string | null }) {
    return this.http.post(this.api, payload);
  }

  updateTask(id: string, payload: { title: string; description?: string | null; completed: boolean }) {
    return this.http.put(`${this.api}/${id}`, payload);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }
}