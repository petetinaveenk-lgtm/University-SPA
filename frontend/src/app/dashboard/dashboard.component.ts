import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../core/services/dashboard.service';
import { DashboardStats } from '../core/models/university.models';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <!-- Header Banner -->
      <div class="dashboard-banner">
        <div>
          <h1 class="page-title">University Executive Dashboard</h1>
          <p class="page-subtitle" style="margin-bottom: 0;">
            Real-time analytics and academic lifecycle metrics powered by local JSON database engine.
          </p>
        </div>
        <button class="btn btn-primary" (click)="loadDashboardData()">
          <i class="ri-refresh-line" [ngClass]="{ 'spin-icon': isLoading }"></i>
          <span>Refresh Analytics</span>
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading && !stats) {
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>Gathering campus statistics...</p>
        </div>
      }

      @if (stats) {
        <!-- Metric Cards Row -->
        <div class="metrics-grid">
          <!-- Total Students -->
          <div class="metric-card metric-indigo">
            <div class="metric-icon">
              <i class="ri-user-smile-line"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Total Students</span>
              <span class="metric-value">{{ stats.totalStudents }}</span>
              <div class="metric-meta">
                <span class="badge badge-primary"><i class="ri-arrow-up-line"></i> Enrolled</span>
                <span class="meta-note">Active cohort</span>
              </div>
            </div>
          </div>

          <!-- Total Faculty -->
          <div class="metric-card metric-teal">
            <div class="metric-icon">
              <i class="ri-team-line"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Total Faculty</span>
              <span class="metric-value">{{ stats.totalFaculty }}</span>
              <div class="metric-meta">
                <span class="badge badge-info"><i class="ri-check-line"></i> Appointed</span>
                <span class="meta-note">Across all depts</span>
              </div>
            </div>
          </div>

          <!-- Total Courses -->
          <div class="metric-card metric-purple">
            <div class="metric-icon">
              <i class="ri-book-open-line"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Total Courses</span>
              <span class="metric-value">{{ stats.totalCourses }}</span>
              <div class="metric-meta">
                <span class="badge badge-slate"><i class="ri-award-line"></i> Accredited</span>
                <span class="meta-note">Undergraduate & Grad</span>
              </div>
            </div>
          </div>

          <!-- Total Departments -->
          <div class="metric-card metric-amber">
            <div class="metric-icon">
              <i class="ri-building-4-line"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Departments</span>
              <span class="metric-value">{{ stats.totalDepartments }}</span>
              <div class="metric-meta">
                <span class="badge badge-warning"><i class="ri-community-line"></i> Schools</span>
                <span class="meta-note">Academic units</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary Insights Grid -->
        <div class="insights-grid">
          <!-- Recent Student Registrations -->
          <div class="card" style="grid-column: span 2;">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-user-add-line" style="color: var(--primary-600);"></i>
                Recent Student Registrations
              </div>
              <a routerLink="/students" class="btn btn-secondary btn-sm">
                View All Students <i class="ri-arrow-right-line"></i>
              </a>
            </div>

            @if (stats.recentStudents.length === 0) {
              <div class="empty-state">
                <i class="ri-user-search-line"></i>
                <h3>No Recent Registrations</h3>
                <p>Register new students in the Student Management module to view them here.</p>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="table-modern">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Full Name</th>
                      <th>Department</th>
                      <th>Class Year</th>
                      <th>Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (student of stats.recentStudents; track student.id) {
                      <tr>
                        <td>
                          <span class="id-pill">{{ student.id }}</span>
                        </td>
                        <td>
                          <div style="font-weight: 600;">{{ student.name }}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">{{ student.email }}</div>
                        </td>
                        <td>
                          <span class="badge badge-primary">{{ student.department }}</span>
                        </td>
                        <td>{{ student.year }}</td>
                        <td>
                          <span style="font-family: var(--font-mono); font-size: 0.8rem;">
                            {{ student.enrollmentDate }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Academic Highlights & Department Distribution -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-pie-chart-2-line" style="color: var(--accent-purple);"></i>
                Department Enrollment
              </div>
              <span class="badge badge-success">Live Sync</span>
            </div>

            <div class="department-list">
              @for (dept of stats.departmentBreakdown; track dept.department) {
                <div class="dept-progress-item">
                  <div class="dept-info">
                    <span class="dept-name">{{ dept.department }} ({{ dept.code }})</span>
                    <span class="dept-count">{{ dept.studentCount }} students</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" [style.width.%]="stats.totalStudents > 0 ? (dept.studentCount / stats.totalStudents * 100) : 0"></div>
                  </div>
                </div>
              }
            </div>

            <!-- Attendance Rate Callout -->
            <div class="attendance-callout">
              <div class="callout-header">
                <span>Campus Attendance Rate</span>
                <span class="callout-percentage">{{ stats.overallAttendanceRate }}%</span>
              </div>
              <div class="progress-bar-bg" style="height: 10px;">
                <div class="progress-bar-fill attendance-fill" [style.width.%]="stats.overallAttendanceRate"></div>
              </div>
              <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--text-muted);">Calculated across recorded classes</span>
                <a routerLink="/attendance" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                  View Attendance
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      padding: 1.5rem 1.75rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;
    }

    .metric-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }

    .metric-indigo::after { background: linear-gradient(90deg, #6366f1, #818cf8); }
    .metric-teal::after { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
    .metric-purple::after { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
    .metric-amber::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

    .metric-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .metric-indigo .metric-icon { background: var(--primary-100); color: var(--primary-600); }
    .metric-teal .metric-icon { background: #cffafe; color: #0891b2; }
    .metric-purple .metric-icon { background: #ede9fe; color: #7c3aed; }
    .metric-amber .metric-icon { background: #fef3c7; color: #d97706; }

    .metric-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .metric-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      font-size: 2.1rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--text-main);
      line-height: 1.1;
      margin: 0.25rem 0 0.5rem;
    }

    .metric-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .meta-note {
      font-size: 0.725rem;
      color: var(--text-subtle);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .id-pill {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary-700);
      background: var(--primary-50);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .department-list {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      margin-bottom: 1.5rem;
    }

    .dept-progress-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .dept-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.825rem;
    }

    .dept-name {
      font-weight: 600;
      color: var(--text-main);
    }

    .dept-count {
      color: var(--text-muted);
    }

    .progress-bar-bg {
      width: 100%;
      height: 7px;
      background: var(--bg-card-alt);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-600), var(--accent-purple));
      border-radius: var(--radius-full);
      transition: width 0.6s ease;
    }

    .attendance-callout {
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.125rem;
    }

    .callout-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .callout-percentage {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--accent-emerald);
    }

    .attendance-fill {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .spin-icon {
      animation: spin 0.8s linear infinite;
    }

    @media (max-width: 1024px) {
      .insights-grid {
        grid-template-columns: 1fr;
      }
      .card[style*="span 2"] {
        grid-column: span 1 !important;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private notificationService = inject(NotificationService);

  stats: DashboardStats | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(
          err.error?.message || 'Failed to connect to backend server. Make sure port 3000 is running.'
        );
      }
    });
  }
}
