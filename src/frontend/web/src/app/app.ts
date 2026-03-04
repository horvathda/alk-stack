import { Component } from '@angular/core';
import { TaskListComponent } from './pages/task-list/task-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskListComponent],
  template: `<app-task-list />`
})
export class App { }