import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { TaskStore, TaskState } from '../../state/task-store';
import { TaskItem } from '../../services/task';

@Component({
  selector: 'app-task-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-manage.html'
})
export class TaskManageComponent implements OnInit {
  vm$: Observable<TaskState>;

  selectedId: string | null = null;
  title = '';
  description = '';
  completed = false;

  constructor(public store: TaskStore) {
    this.vm$ = this.store.vm$;
  }

  ngOnInit(): void {
    this.store.refresh();
  }

  selectTask(t: TaskItem) {
    if (!t.id) return;

    this.selectedId = t.id;
    this.title = t.title;
    this.description = t.description ?? '';
    this.completed = t.completed;
  }

  resetForm() {
    this.selectedId = null;
    this.title = '';
    this.description = '';
    this.completed = false;
  }

  save() {
    const title = this.title.trim();
    if (!title) return;

    const description = this.description?.trim() || null;

    if (this.selectedId) {
      this.store.update(this.selectedId, title, description, this.completed);
      return;
    }

    this.store.create(title, description);
    this.resetForm();
  }
}