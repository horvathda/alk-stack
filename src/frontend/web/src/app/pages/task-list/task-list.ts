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
    this.store.setPageSize(30);
    this.store.refresh();
  }

  trackById(index: number, t: TaskItem) {
    return t.id ?? index;
  }

  isSaving(vm: TaskState, t: TaskItem) {
    return !!t.id && 'savingIds' in vm && Array.isArray((vm as any).savingIds) && (vm as any).savingIds.includes(t.id);
  }

  isDeleting(vm: TaskState, t: TaskItem) {
    return !!t.id && 'deletingIds' in vm && Array.isArray((vm as any).deletingIds) && (vm as any).deletingIds.includes(t.id);
  }

  getPendingCount(vm: TaskState): number {
    return vm.items.filter(t => !t.completed).length;
  }

  getCompletedCount(vm: TaskState): number {
    return vm.items.filter(t => t.completed).length;
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