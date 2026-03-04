import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskApi, TaskItem } from '../../services/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html'
})
export class TaskListComponent {
  private api = new TaskApi();

  tasks: TaskItem[] = [];
  page = 1;
  pageSize = 5;
  total = 0;

  newTitle = '';
  newDescription = '';

  loading = false;
  error: string | null = null;

  constructor() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;

    this.api.getTasks(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.tasks = res.items;
        this.total = res.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Failed to load tasks';
        this.loading = false;
      }
    });
  }

  create() {
    const title = this.newTitle.trim();
    if (!title) return;

    this.api.createTask({ title, description: this.newDescription?.trim() || null }).subscribe({
      next: () => {
        this.newTitle = '';
        this.newDescription = '';
        this.page = 1;
        this.load();
      },
      error: (err) => this.error = err?.message ?? 'Failed to create'
    });
  }

  toggle(t: TaskItem) {
    if (!t.id) return;

    this.api.updateTask(t.id, {
      title: t.title,
      description: t.description ?? null,
      completed: !t.completed
    }).subscribe({
      next: () => this.load(),
      error: (err) => this.error = err?.message ?? 'Failed to update'
    });
  }

  remove(t: TaskItem) {
    if (!t.id) return;

    this.api.deleteTask(t.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error = err?.message ?? 'Failed to delete'
    });
  }

  canPrev() { return this.page > 1; }
  canNext() { return this.page * this.pageSize < this.total; }

  prev() { if (this.canPrev()) { this.page--; this.load(); } }
  next() { if (this.canNext()) { this.page++; this.load(); } }
}
