
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { TaskApi, TaskItem } from '../../services/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.html'
})
export class TaskListComponent implements OnInit {
  private api = new TaskApi();

  tasks: TaskItem[] = [];
  page = 1;
  pageSize = 5;
  total = 0;

  loading = false;
  error: string | null = null;

  // per-item “busy” védelem (ne lehessen spam-kattintani)
  busyIds = new Set<string>();

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;

    this.api.getTasks(this.page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.tasks = res?.items ?? [];
          this.total = res?.total ?? 0;
        },
        error: (err) => {
          this.error = err?.message ?? 'Failed to load tasks';
          this.tasks = [];
          this.total = 0;
        }
      });
  }

  toggle(t: TaskItem) {
    if (!t.id || this.busyIds.has(t.id)) return;

    this.busyIds.add(t.id);
    this.error = null;

    this.api.updateTask(t.id, {
      title: t.title,
      description: t.description ?? null,
      completed: !t.completed
    })
      .pipe(finalize(() => this.busyIds.delete(t.id!)))
      .subscribe({
        next: () => this.load(), // mindig DB-ből frissít
        error: (err) => {
          this.error = err?.message ?? 'Failed to update';
        }
      });
  }

  remove(t: TaskItem) {
    if (!t.id || this.busyIds.has(t.id)) return;

    this.busyIds.add(t.id);
    this.error = null;

    this.api.deleteTask(t.id)
      .pipe(finalize(() => this.busyIds.delete(t.id!)))
      .subscribe({
        next: () => {
          // ha az utolsó elemet törölted az oldalon, lépj vissza 1 oldalt ha kell
          if (this.page > 1 && this.tasks.length === 1) this.page--;
          this.load(); // mindig DB-ből frissít
        },
        error: (err) => {
          this.error = err?.message ?? 'Failed to delete';
        }
      });
  }

  canPrev() {
    return !this.loading && this.page > 1;
  }

  canNext() {
    return !this.loading && (this.page * this.pageSize) < this.total;
  }

  prev() {
    if (!this.canPrev()) return;
    this.page--;
    this.load();
  }

  next() {
    if (!this.canNext()) return;
    this.page++;
    this.load();
  }
}