import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TaskStore, TaskState } from '../../state/task-store';
import { TaskItem } from '../../services/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.html'
})
export class TaskListComponent implements OnInit {
  vm$: Observable<TaskState>;

  constructor(public store: TaskStore) {
    this.vm$ = this.store.vm$;
  }

  ngOnInit(): void {
    this.store.setPageSize(10);
    this.store.refresh();
  }

  trackById(index: number, t: TaskItem) {
    return t.id ?? index;
  }

  isSaving(vm: TaskState, t: TaskItem) {
    return !!t.id &&
      Array.isArray(vm.savingIds) &&
      vm.savingIds.includes(t.id);
  }

  isDeleting(vm: TaskState, t: TaskItem) {
    return !!t.id &&
      Array.isArray(vm.deletingIds) &&
      vm.deletingIds.includes(t.id);
  }

  getPendingCount(vm: TaskState): number {
    return vm.pendingCount;
  }

  getCompletedCount(vm: TaskState): number {
    return vm.completedCount;
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

  toggle(t: TaskItem) {
    if (!t.id) return;
    this.store.update(t.id, t.title, t.description ?? null, !t.completed);
  }

  remove(t: TaskItem) {
    if (!t.id) return;
    this.store.delete(t.id);
  }
}