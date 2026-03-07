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
  templateUrl: './task-manage.html',
  styleUrl: './task-manage.css'
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
    this.store.setPageSize(10);
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

  getTotalPages(vm: TaskState): number {
    if (!vm.pageSize || vm.pageSize < 1) return 1;
    return Math.max(1, Math.ceil(vm.total / vm.pageSize));
  }

  canGoPrev(vm: TaskState): boolean {
    return vm.page > 1;
  }

  canGoNext(vm: TaskState): boolean {
    return vm.page < this.getTotalPages(vm);
  }

  goPrev(vm: TaskState) {
    if (!this.canGoPrev(vm)) return;
    this.store.setPage(vm.page - 1);
  }

  goNext(vm: TaskState) {
    if (!this.canGoNext(vm)) return;
    this.store.setPage(vm.page + 1);
  }

  isSelectedTaskVisible(vm: TaskState): boolean {
    if (!this.selectedId) return false;
    return vm.items.some(t => t.id === this.selectedId);
  }
}