import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskApi, TaskItem } from '../../services/task';

@Component({
  selector: 'app-task-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-manage.html'
})

export class TaskManageComponent {
  private api = new TaskApi();

  // lista a kiválasztáshoz
  tasks: TaskItem[] = [];
  selectedId: string | null = null;

  // form mezők
  title = '';
  description = '';
  completed = false;

  loading = false;
  error: string | null = null;

  constructor() {
    this.refreshList();
  }

  refreshList() {
    this.api.getTasks(1, 100).subscribe({
      next: (res) => this.tasks = res.items,
      error: (err) => this.error = err?.message ?? 'Failed to load tasks'
    });
  }

  selectTask(id: string) {
    const t = this.tasks.find(x => x.id === id);
    if (!t) return;
    this.selectedId = id;
    this.title = t.title;
    this.description = t.description ?? '';
    this.completed = t.completed;
  }

  resetForm() {
    this.selectedId = null;
    this.title = '';
    this.description = '';
    this.completed = false;
    this.error = null;
  }

  save() {
    const title = this.title.trim();
    if (!title) return;

    this.loading = true;
    this.error = null;

    // UPDATE
    if (this.selectedId) {
      this.api.updateTask(this.selectedId, {
        title,
        description: this.description?.trim() || null,
        completed: this.completed
      }).subscribe({
        next: () => { this.loading = false; this.refreshList(); },
        error: (err) => { this.loading = false; this.error = err?.message ?? 'Update failed'; }
      });
      return;
    }

    // CREATE
    this.api.createTask({
      title,
      description: this.description?.trim() || null
    }).subscribe({
      next: () => { this.loading = false; this.resetForm(); this.refreshList(); },
      error: (err) => { this.loading = false; this.error = err?.message ?? 'Create failed'; }
    });
  }
}