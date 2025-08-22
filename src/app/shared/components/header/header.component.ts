import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  active?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header" [class.dark-mode]="isDarkMode">
      <div class="header-container">
        <!-- Logo & Home Link -->
        <div class="header-left">
          <a routerLink="/home" class="logo-link">
            <span class="logo-icon">🎯</span>
            <span class="logo-text">LPIC Simulator</span>
          </a>
        </div>

        <!-- Breadcrumbs -->
        <nav class="breadcrumbs" *ngIf="breadcrumbs && breadcrumbs.length > 0">
          <ol class="breadcrumb-list">
            <li class="breadcrumb-item" *ngFor="let item of breadcrumbs; let last = last">
              <ng-container *ngIf="!last && item.route; else lastItem">
                <a [routerLink]="item.route" class="breadcrumb-link">{{ item.label }}</a>
              </ng-container>
              <ng-template #lastItem>
                <span class="breadcrumb-current">{{ item.label }}</span>
              </ng-template>
            </li>
          </ol>
        </nav>

        <!-- Header Right - Theme Toggle -->
        <div class="header-right">
          <button 
            class="theme-toggle"
            (click)="toggleTheme()"
            [attr.aria-label]="isDarkMode ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'"
          >
            <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
            <span class="theme-text">{{ isDarkMode ? 'Light' : 'Dark' }}</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: #ffffff;
      color: #2c3e50;
      padding: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      border-bottom: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .app-header.dark-mode {
      background: #1a1a1a;
      color: #ffffff;
      border-bottom-color: #333333;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }

    .header-left {
      display: flex;
      align-items: center;
      padding-left: 1rem;
    }

    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
      font-weight: 600;
      font-size: 1.1rem;
      transition: opacity 0.2s ease;
    }

    .logo-link:hover {
      opacity: 0.8;
    }

    .logo-icon {
      font-size: 1.3rem;
      margin-right: 0.5rem;
    }

    .logo-text {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .breadcrumbs {
      flex: 1;
      margin: 0 2rem;
    }

    .breadcrumb-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
    }

    .breadcrumb-item:not(:last-child)::after {
      content: '›';
      margin: 0 0.5rem;
      color: #6c757d;
      font-weight: bold;
    }

    .dark-mode .breadcrumb-item:not(:last-child)::after {
      color: #adb5bd;
    }

    .breadcrumb-link {
      color: #6c757d;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .dark-mode .breadcrumb-link {
      color: #adb5bd;
    }

    .breadcrumb-link:hover {
      color: #495057;
    }

    .dark-mode .breadcrumb-link:hover {
      color: #ffffff;
    }

    .breadcrumb-current {
      color: #2c3e50;
      font-weight: 500;
    }

    .dark-mode .breadcrumb-current {
      color: #ffffff;
    }

    .header-right {
      display: flex;
      align-items: center;
      padding-right: 1rem;
    }

    /* Theme Toggle Button */
    .theme-toggle {
      background: transparent;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: inherit;
    }

    .dark-mode .theme-toggle {
      border-color: #333333;
    }

    .theme-toggle:hover {
      background: #f8f9fa;
      border-color: #dee2e6;
    }

    .dark-mode .theme-toggle:hover {
      background: #2a2a2a;
      border-color: #444444;
    }

    .theme-icon {
      font-size: 1rem;
    }

    .theme-text {
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-container {
        height: 50px;
      }

      .logo-text {
        font-size: 1rem;
      }

      .breadcrumbs {
        margin: 0 1rem;
        order: 3;
        width: 100%;
        margin-top: 0.5rem;
      }

      .breadcrumb-list {
        justify-content: center;
        font-size: 0.8rem;
      }

      .theme-text {
        display: none;
      }

      .theme-toggle {
        padding: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .header-container {
        flex-direction: column;
        height: auto;
        padding: 0.5rem 0;
      }

      .breadcrumbs {
        order: 2;
        margin: 0.5rem 0;
      }

      .header-right {
        order: 3;
        margin-top: 0.5rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  
  isDarkMode = false;

  ngOnInit(): void {
    this.loadThemePreference();
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.saveThemePreference();
    this.applyTheme();
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      // Auto-detect based on system preference
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  private saveThemePreference(): void {
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }
}
