import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav style="display:flex; gap:12px; padding:12px; border-bottom:1px solid #ddd;">
      <a routerLink="/tasks" routerLinkActive="active">Feladatok</a>
      <a routerLink="/manage" routerLinkActive="active">Hozzáadás / módosítás</a>
    </nav>

    <main style="padding:12px;">
      <router-outlet />
    </main>
  `,
  styles: [`
    a { text-decoration: none; }
    .active { font-weight: bold; }
  `]
})
export class App {}