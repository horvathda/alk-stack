import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template:
    `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar-inner">
          <a routerLink="/tasks" class="brand">
            <span class="brand-mark">✓</span>
            <div>
              <strong>TaskFlow</strong>
              <small>Feladatkezelő</small>
            </div>
          </a>

          <nav class="nav-links">
            <a
              routerLink="/tasks"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link"
            >
              Feladatok
            </a>

            <a
              routerLink="/manage"
              routerLinkActive="active"
              class="nav-link"
            >
              Hozzáadás / módosítás
            </a>
          </nav>
        </div>
      </header>

      <main class="page-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: ["./styles.css"]
})
export class App { }