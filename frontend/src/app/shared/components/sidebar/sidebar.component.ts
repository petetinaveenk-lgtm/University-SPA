import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay for mobile drawer -->
    @if (isOpen) {
      <div class="sidebar-backdrop" (click)="closeSidebar.emit()"></div>
    }

    <aside class="sidebar-container" [ngClass]="{ 'is-open': isOpen }">
      <!-- University Branding Header -->
      <div class="brand-header">
        <div class="brand-crest">
          <i class="ri-graduation-cap-fill"></i>
        </div>
        <div class="brand-text">
          <div class="brand-title">APEX UNIVERSITY</div>
          <div class="brand-subtitle">Academic ERP System</div>
        </div>
      </div>

      <!-- Navigation Section -->
      <nav class="nav-menu">
        <div class="nav-section-label">MAIN NAVIGATION</div>

        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item" (click)="onNavClick()">
          <i class="ri-dashboard-3-line"></i>
          <span>Dashboard</span>
        </a>

        <div class="nav-section-label" style="margin-top: 1.25rem;">ACADEMIC MANAGEMENT</div>

        <a routerLink="/students" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="ri-user-smile-line"></i>
          <span>Students</span>
        </a>

        <a routerLink="/faculty" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="ri-team-line"></i>
          <span>Faculty</span>
        </a>

        <a routerLink="/courses" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="ri-book-open-line"></i>
          <span>Courses</span>
        </a>

        <a routerLink="/departments" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="ri-building-4-line"></i>
          <span>Departments</span>
        </a>

        <div class="nav-section-label" style="margin-top: 1.25rem;">CAMPUS OPERATIONS</div>

        <a routerLink="/timetable" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="ri-calendar-todo-line"></i>
          <span>Timetable</span>
        </a>

        <a routerLink="/attendance" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="ri-check-double-line"></i>
          <span>Attendance</span>
        </a>
      </nav>

      <!-- Sidebar Footer Badge -->
      <div class="sidebar-footer">
        <div class="storage-indicator">
          <i class="ri-database-2-line"></i>
          <div>
            <div style="font-size: 0.725rem; font-weight: 700; color: #cbd5e1;">STORAGE ENGINE</div>
            <div style="font-size: 0.675rem; color: #94a3b8;">Local JSON Database</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 260px;
      background: var(--bg-sidebar);
      color: var(--text-inverse);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 150;
      transition: transform var(--transition-normal);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
    }

    .brand-header {
      padding: 1.5rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.15);
    }

    .brand-crest {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    .brand-title {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 0.95rem;
      letter-spacing: 0.06em;
      color: white;
    }

    .brand-subtitle {
      font-size: 0.7rem;
      color: #94a3b8;
      letter-spacing: 0.02em;
    }

    .nav-menu {
      flex: 1;
      padding: 1.25rem 0.85rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-section-label {
      font-size: 0.675rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 0.5rem 0.85rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 0.95rem;
      border-radius: var(--radius-md);
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: all var(--transition-fast);
      position: relative;
    }

    .nav-item i {
      font-size: 1.15rem;
      transition: transform var(--transition-fast);
    }

    .nav-item:hover {
      background: var(--bg-sidebar-hover);
      color: white;
    }

    .nav-item:hover i {
      transform: scale(1.1);
      color: var(--primary-400);
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05));
      color: #ffffff;
      font-weight: 600;
      border-left: 3px solid var(--primary-400);
    }

    .nav-item.active i {
      color: var(--primary-400);
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }

    .storage-indicator {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.75rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .storage-indicator i {
      font-size: 1.15rem;
      color: var(--primary-400);
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 900px) {
      .sidebar-container {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
      }

      .sidebar-container.is-open {
        transform: translateX(0);
      }

      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        z-index: 140;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onNavClick(): void {
    if (window.innerWidth <= 900) {
      this.closeSidebar.emit();
    }
  }
}
