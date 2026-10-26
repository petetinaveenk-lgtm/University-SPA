import { Component, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="top-nav">
      <div class="nav-left">
        <button class="mobile-toggle-btn" (click)="toggleSidebar.emit()" aria-label="Toggle Navigation">
          <i class="ri-menu-2-line"></i>
        </button>
        <div class="nav-brand-title">
          <span class="system-badge">PORTAL</span>
          <span class="portal-name">University Operations Center</span>
        </div>
      </div>

      <div class="nav-right">
        <!-- Live Backend Status -->
        <div 
          class="server-status" 
          [ngClass]="{ 'online': isServerOnline, 'offline': !isServerOnline }" 
          [title]="isServerOnline ? 'Backend API connected on http://localhost:3000' : 'Backend API disconnected or unreachable'"
        >
          <span class="status-dot"></span>
          <span class="status-text">{{ isServerOnline ? 'API Connected' : 'API Disconnected' }}</span>
        </div>

        <div class="divider"></div>

        <!-- Academic Semester Badge -->
        <div class="academic-badge">
          <i class="ri-calendar-event-line"></i>
          <span>Academic Year 2026-27</span>
        </div>

        <div class="divider"></div>

        <!-- User Profile -->
        <div class="user-chip">
          <div class="user-avatar">
            <i class="ri-user-star-fill"></i>
          </div>
          <div class="user-info">
            <div class="user-name">Dr. Campus Dean</div>
            <div class="user-role">Super Administrator</div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-nav {
      height: 70px;
      background: white;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-toggle-btn {
      display: none;
      background: none;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.5rem;
      cursor: pointer;
      color: var(--text-main);
      font-size: 1.25rem;
    }

    .nav-brand-title {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .system-badge {
      background: var(--primary-100);
      color: var(--primary-700);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-sm);
    }

    .portal-name {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--text-main);
      font-family: var(--font-heading);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .server-status {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .server-status.online {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .server-status.offline {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .academic-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-muted);
      background: var(--bg-card-alt);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
    }

    .divider {
      width: 1px;
      height: 24px;
      background: var(--border-subtle);
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    @media (max-width: 900px) {
      .academic-badge, .divider {
        display: none;
      }
      .mobile-toggle-btn {
        display: flex;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  private dashboardService = inject(DashboardService);
  private pollSub?: Subscription;

  isServerOnline = false;

  ngOnInit(): void {
    // Check initial health status immediately
    this.checkHealth();

    // Check periodically every 20 seconds, properly managed via RxJS
    this.pollSub = interval(20000).subscribe(() => {
      this.checkHealth();
    });
  }

  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  checkHealth(): void {
    this.dashboardService.checkHealth().subscribe({
      next: (res) => {
        if (res && (res.status === 'ok' || res.status === 'online' || res.success === true)) {
          this.isServerOnline = true;
        } else {
          this.isServerOnline = false;
        }
      },
      error: () => {
        this.isServerOnline = false;
      }
    });
  }
}
