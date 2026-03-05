import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list';
import { TaskManageComponent } from './pages/task-manage/task-manage';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'tasks', component: TaskListComponent },
  { path: 'manage', component: TaskManageComponent },
  { path: '**', redirectTo: 'tasks' }
];