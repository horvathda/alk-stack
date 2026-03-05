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
    this.store.refresh();
  }

  toggle(t: TaskItem) {
    if (!t.id) return;
    this.store.update(t.id, t.title, t.description ?? null, !t.completed);
  }

  remove(t: TaskItem) {
    if (!t.id) return;
    this.store.delete(t.id);
  }

  prev(vm: TaskState) {
    if (vm.page > 1) this.store.setPage(vm.page - 1);
  }

  next(vm: TaskState) {
    if (vm.page * vm.pageSize < vm.total) this.store.setPage(vm.page + 1);
  }
}