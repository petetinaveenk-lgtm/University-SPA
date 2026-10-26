import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../core/services/attendance.service';
import { StudentsService } from '../core/services/students.service';
import { CoursesService } from '../core/services/courses.service';
import { Attendance, AttendanceSummary, Course, Student } from '../core/models/university.models';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <!-- Title & Action Header -->
      <div class="dashboard-banner">
        <div>
          <h1 class="page-title">Attendance Tracking & Analytics</h1>
          <p class="page-subtitle" style="margin-bottom: 0;">
            Track class roll calls, evaluate student attendance percentages, and maintain tamper-free lecture records.
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" (click)="openSingleModal()">
            <i class="ri-user-add-line"></i>
            <span>Log Single Entry</span>
          </button>
          <button class="btn btn-primary" (click)="openBatchModal()">
            <i class="ri-calendar-check-line"></i>
            <span>Take Class Roll Call</span>
          </button>
        </div>
      </div>

      <!-- View Switcher Tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem;">
        <button 
          class="tab-btn" 
          [ngClass]="{ 'active': activeTab === 'records' }"
          (click)="switchTab('records')"
        >
          <i class="ri-list-check-2"></i> Attendance Log Records
        </button>
        <button 
          class="tab-btn" 
          [ngClass]="{ 'active': activeTab === 'summary' }"
          (click)="switchTab('summary')"
        >
          <i class="ri-pie-chart-line"></i> Student Percentages & Standing
        </button>
      </div>

      <!-- Tab 1: Attendance Log Records -->
      @if (activeTab === 'records') {
        <!-- Search & Filter Toolbar -->
        <div class="toolbar-container">
          <div class="filter-group">
            <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted);">Course:</label>
            <select class="filter-select" [(ngModel)]="filterCourse" (change)="loadRecords()">
              <option value="All">All Courses</option>
              @for (c of courses; track c.id) {
                <option [value]="c.courseName">{{ c.courseCode }} — {{ c.courseName }}</option>
              }
            </select>

            <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted); margin-left: 0.5rem;">Date:</label>
            <input 
              type="date" 
              class="form-control" 
              style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
              [(ngModel)]="filterDate" 
              (change)="loadRecords()" 
            />

            <button *ngIf="filterDate" class="btn btn-secondary btn-sm" (click)="clearDateFilter()" title="Clear date">
              <i class="ri-close-line"></i>
            </button>

            <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted); margin-left: 0.5rem;">Status:</label>
            <select class="filter-select" [(ngModel)]="filterStatus" (change)="loadRecords()">
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <!-- Records Table -->
        @if (isLoadingRecords) {
          <div class="spinner-container">
            <div class="spinner"></div>
            <p>Fetching attendance logs...</p>
          </div>
        } @else if (attendanceRecords.length === 0) {
          <div class="card">
            <div class="empty-state">
              <i class="ri-file-list-3-line"></i>
              <h3>No Attendance Records Found</h3>
              <p>No roll call has been recorded for the selected filter. Click "Take Class Roll Call" to log attendance.</p>
              <button class="btn btn-primary" (click)="openBatchModal()">
                <i class="ri-calendar-check-line"></i> Record Class Attendance
              </button>
            </div>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Info</th>
                  <th>Course / Subject</th>
                  <th>Status</th>
                  <th>Remarks / Notes</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (record of attendanceRecords; track record.id) {
                  <tr>
                    <td>
                      <span style="font-family: var(--font-mono); font-weight: 600; font-size: 0.85rem;">
                        {{ record.date }}
                      </span>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">
                        {{ record.studentName }}
                      </div>
                      <span class="id-pill">{{ record.studentId }}</span>
                    </td>
                    <td>
                      <span class="badge badge-primary">{{ record.course }}</span>
                    </td>
                    <td>
                      <span 
                        class="badge" 
                        [ngClass]="record.status === 'Present' ? 'badge-success' : 'badge-danger'"
                      >
                        <i [ngClass]="record.status === 'Present' ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"></i>
                        {{ record.status }}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 0.85rem; color: var(--text-muted);">
                        {{ record.remarks || '—' }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions" style="justify-content: flex-end;">
                        <button 
                          class="btn btn-secondary btn-sm" 
                          title="Toggle Present/Absent" 
                          (click)="toggleRecordStatus(record)"
                        >
                          <i class="ri-arrow-left-right-line"></i> Flip Status
                        </button>
                        <button class="btn btn-danger btn-sm" title="Delete Entry" (click)="confirmDelete(record)">
                          <i class="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      <!-- Tab 2: Student Percentages & Standing -->
      @if (activeTab === 'summary') {
        <div class="toolbar-container">
          <div class="filter-group">
            <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted);">Filter by Course:</label>
            <select class="filter-select" [(ngModel)]="summaryCourse" (change)="loadSummary()">
              <option value="All">All Courses (Aggregate)</option>
              @for (c of courses; track c.id) {
                <option [value]="c.courseName">{{ c.courseCode }} — {{ c.courseName }}</option>
              }
            </select>
          </div>
        </div>

        @if (isLoadingSummary) {
          <div class="spinner-container">
            <div class="spinner"></div>
            <p>Calculating student attendance percentages...</p>
          </div>
        } @else if (summaryList.length === 0) {
          <div class="card">
            <div class="empty-state">
              <i class="ri-pie-chart-line"></i>
              <h3>No Attendance Statistics</h3>
              <p>Attendance records will compute percentage ratios automatically once records are saved.</p>
            </div>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Total Classes</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th style="min-width: 200px;">Attendance Ratio</th>
                  <th>Standing</th>
                </tr>
              </thead>
              <tbody>
                @for (student of summaryList; track student.studentId) {
                  <tr>
                    <td>
                      <span class="id-pill">{{ student.studentId }}</span>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">
                        {{ student.studentName }}
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-slate">{{ student.department || 'N/A' }}</span>
                    </td>
                    <td style="font-weight: 600;">{{ student.totalClasses }}</td>
                    <td style="color: #15803d; font-weight: 700;">{{ student.presentCount }}</td>
                    <td style="color: #b91c1c; font-weight: 700;">{{ student.absentCount }}</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="progress-bar-bg" style="flex: 1; height: 9px;">
                          <div 
                            class="progress-bar-fill"
                            [ngStyle]="{
                              'width.%': student.percentage,
                              'background': student.percentage >= 75 ? '#10b981' : (student.percentage >= 50 ? '#f59e0b' : '#ef4444')
                            }"
                          ></div>
                        </div>
                        <span style="font-weight: 700; font-size: 0.875rem; min-width: 48px;">
                          {{ student.percentage }}%
                        </span>
                      </div>
                    </td>
                    <td>
                      @if (student.percentage >= 75) {
                        <span class="badge badge-success">Good Standing</span>
                      } @else if (student.percentage >= 50) {
                        <span class="badge badge-warning">At Risk (&lt;75%)</span>
                      } @else {
                        <span class="badge badge-danger">Critical (&lt;50%)</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>

    <!-- Batch Class Roll Call Modal -->
    @if (isBatchModalOpen) {
      <div class="modal-backdrop" (click)="isBatchModalOpen = false">
        <div class="modal-dialog" style="max-width: 680px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <i class="ri-calendar-check-line" style="color: var(--primary-600);"></i>
              Take Class Attendance Roll Call
            </div>
            <button class="modal-close" (click)="isBatchModalOpen = false">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="submitBatchAttendance()">
            <div class="modal-body">
              <div class="form-grid" style="margin-bottom: 1.25rem;">
                <!-- Course -->
                <div class="form-group">
                  <label class="form-label">Course / Class <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="batchCourse" name="batchCourse" required>
                    <option value="" disabled>Select Course</option>
                    @for (c of courses; track c.id) {
                      <option [value]="c.courseName">{{ c.courseCode }} — {{ c.courseName }}</option>
                    }
                  </select>
                </div>

                <!-- Date -->
                <div class="form-group">
                  <label class="form-label">Lecture Date <span class="required">*</span></label>
                  <input type="date" class="form-control" [(ngModel)]="batchDate" name="batchDate" required />
                </div>
              </div>

              <!-- Quick Mark All buttons -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle);">
                <span style="font-weight: 700; font-size: 0.875rem;">Students Roll Call Sheet ({{ allStudents.length }})</span>
                <div style="display: flex; gap: 0.5rem;">
                  <button type="button" class="btn btn-secondary btn-sm" (click)="setAllBatchStatus('Present')">
                    Mark All Present
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" (click)="setAllBatchStatus('Absent')">
                    Mark All Absent
                  </button>
                </div>
              </div>

              <!-- Students List with Toggles -->
              <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
                @for (student of batchStudents; track student.studentId) {
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.85rem; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border-subtle);">
                    <div>
                      <span style="font-weight: 600; font-size: 0.875rem;">{{ student.studentName }}</span>
                      <span class="id-pill" style="margin-left: 0.5rem; font-size: 0.75rem;">{{ student.studentId }}</span>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">{{ student.department }}</div>
                    </div>

                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <button 
                        type="button" 
                        class="btn btn-sm" 
                        [ngClass]="student.status === 'Present' ? 'btn-primary' : 'btn-secondary'"
                        (click)="student.status = 'Present'"
                      >
                        Present
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-sm" 
                        [ngClass]="student.status === 'Absent' ? 'btn-danger' : 'btn-secondary'"
                        (click)="student.status = 'Absent'"
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="isBatchModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmittingBatch">
                @if (isSubmittingBatch) {
                  <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                }
                Save Attendance Register
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Single Attendance Log Modal -->
    @if (isSingleModalOpen) {
      <div class="modal-backdrop" (click)="isSingleModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <i class="ri-user-add-line" style="color: var(--primary-600);"></i>
              Log Single Attendance Record
            </div>
            <button class="modal-close" (click)="isSingleModalOpen = false">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="submitSingleAttendance()">
            <div class="modal-body">
              <div class="form-grid">
                <!-- Student -->
                <div class="form-group form-full">
                  <label class="form-label">Student <span class="required">*</span></label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="singleForm.studentId" 
                    name="studentId" 
                    required 
                    (change)="onSingleStudentSelect()"
                  >
                    <option value="" disabled>Select Student</option>
                    @for (s of allStudents; track s.id) {
                      <option [value]="s.id">{{ s.id }} — {{ s.name }} ({{ s.department }})</option>
                    }
                  </select>
                </div>

                <!-- Course -->
                <div class="form-group form-full">
                  <label class="form-label">Course / Subject <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="singleForm.course" name="course" required>
                    <option value="" disabled>Select Course</option>
                    @for (c of courses; track c.id) {
                      <option [value]="c.courseName">{{ c.courseCode }} — {{ c.courseName }}</option>
                    }
                  </select>
                </div>

                <!-- Date -->
                <div class="form-group">
                  <label class="form-label">Date <span class="required">*</span></label>
                  <input type="date" class="form-control" [(ngModel)]="singleForm.date" name="date" required />
                </div>

                <!-- Status -->
                <div class="form-group">
                  <label class="form-label">Status <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="singleForm.status" name="status" required>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <!-- Remarks -->
                <div class="form-group form-full">
                  <label class="form-label">Remarks (Optional)</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="singleForm.remarks" 
                    name="remarks" 
                    placeholder="e.g. Excused, Medical reason, Late by 10 mins"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="isSingleModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmittingSingle">
                @if (isSubmittingSingle) {
                  <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                }
                Save Record
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Attendance Record"
      message="Are you sure you want to remove this attendance log?"
      [itemName]="recordToDelete ? recordToDelete.studentName + ' on ' + recordToDelete.date + ' (' + recordToDelete.course + ')' : ''"
      (confirmed)="executeDelete()"
      (cancelled)="isDeleteDialogOpen = false"
    ></app-confirm-dialog>
  `,
  styles: [`
    .dashboard-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      background: white;
      padding: 1.5rem 1.75rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: white;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .tab-btn:hover {
      background: var(--bg-card-alt);
      color: var(--text-main);
    }

    .tab-btn.active {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
    }

    .id-pill {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary-700);
      background: var(--primary-50);
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
      display: inline-block;
    }
  `]
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private studentsService = inject(StudentsService);
  private coursesService = inject(CoursesService);
  private notificationService = inject(NotificationService);

  activeTab: 'records' | 'summary' = 'records';

  attendanceRecords: Attendance[] = [];
  summaryList: AttendanceSummary[] = [];
  courses: Course[] = [];
  allStudents: Student[] = [];

  isLoadingRecords = true;
  isLoadingSummary = false;

  filterCourse = 'All';
  filterDate = '';
  filterStatus = 'All';
  summaryCourse = 'All';

  // Batch Modal
  isBatchModalOpen = false;
  isSubmittingBatch = false;
  batchCourse = '';
  batchDate = new Date().toISOString().split('T')[0];
  batchStudents: { studentId: string; studentName: string; department: string; status: 'Present' | 'Absent' }[] = [];

  // Single Modal
  isSingleModalOpen = false;
  isSubmittingSingle = false;
  singleForm: {
    studentId: string;
    studentName: string;
    course: string;
    date: string;
    status: 'Present' | 'Absent';
    remarks: string;
  } = {
    studentId: '',
    studentName: '',
    course: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: ''
  };

  // Delete Dialog
  isDeleteDialogOpen = false;
  recordToDelete: Attendance | null = null;

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadRecords();
  }

  loadDropdowns(): void {
    this.coursesService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.courses = res.data;
          if (this.courses.length > 0) {
            this.batchCourse = this.courses[0].courseName;
            this.singleForm.course = this.courses[0].courseName;
          }
        }
      }
    });

    this.studentsService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allStudents = res.data;
          if (this.allStudents.length > 0) {
            this.singleForm.studentId = this.allStudents[0].id;
            this.singleForm.studentName = this.allStudents[0].name;
          }
        }
      }
    });
  }

  switchTab(tab: 'records' | 'summary'): void {
    this.activeTab = tab;
    if (tab === 'records') {
      this.loadRecords();
    } else {
      this.loadSummary();
    }
  }

  loadRecords(): void {
    this.isLoadingRecords = true;
    this.attendanceService.getAll({
      course: this.filterCourse,
      date: this.filterDate,
      status: this.filterStatus
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.attendanceRecords = res.data;
        }
        this.isLoadingRecords = false;
      },
      error: (err) => {
        this.isLoadingRecords = false;
        this.notificationService.error(err.error?.message || 'Failed to load attendance logs.');
      }
    });
  }

  clearDateFilter(): void {
    this.filterDate = '';
    this.loadRecords();
  }

  loadSummary(): void {
    this.isLoadingSummary = true;
    this.attendanceService.getSummary(this.summaryCourse).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.summaryList = res.data;
        }
        this.isLoadingSummary = false;
      },
      error: (err) => {
        this.isLoadingSummary = false;
        this.notificationService.error(err.error?.message || 'Failed to load attendance summary.');
      }
    });
  }

  toggleRecordStatus(record: Attendance): void {
    const newStatus: 'Present' | 'Absent' = record.status === 'Present' ? 'Absent' : 'Present';
    this.attendanceService.update(record.id, { status: newStatus }).subscribe({
      next: (res) => {
        record.status = newStatus;
        this.notificationService.success(`Updated ${record.studentName} status to ${newStatus}.`);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error updating record.');
      }
    });
  }

  openSingleModal(): void {
    this.singleForm = {
      studentId: this.allStudents.length > 0 ? this.allStudents[0].id : '',
      studentName: this.allStudents.length > 0 ? this.allStudents[0].name : '',
      course: this.courses.length > 0 ? this.courses[0].courseName : '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      remarks: ''
    };
    this.isSingleModalOpen = true;
  }

  onSingleStudentSelect(): void {
    const s = this.allStudents.find(item => item.id === this.singleForm.studentId);
    if (s) {
      this.singleForm.studentName = s.name;
    }
  }

  submitSingleAttendance(): void {
    if (!this.singleForm.studentId || !this.singleForm.course || !this.singleForm.date) {
      this.notificationService.warning('Please fill in required fields.');
      return;
    }

    this.isSubmittingSingle = true;
    this.attendanceService.create(this.singleForm).subscribe({
      next: (res) => {
        this.isSubmittingSingle = false;
        this.isSingleModalOpen = false;
        this.notificationService.success(res.message || 'Attendance logged.');
        this.loadRecords();
        if (this.activeTab === 'summary') this.loadSummary();
      },
      error: (err) => {
        this.isSubmittingSingle = false;
        this.notificationService.error(err.error?.message || 'Attendance for this student, course, and date already exists.');
      }
    });
  }

  openBatchModal(): void {
    this.batchCourse = this.courses.length > 0 ? this.courses[0].courseName : '';
    this.batchDate = new Date().toISOString().split('T')[0];
    this.batchStudents = this.allStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      department: s.department,
      status: 'Present'
    }));
    this.isBatchModalOpen = true;
  }

  setAllBatchStatus(status: 'Present' | 'Absent'): void {
    this.batchStudents.forEach(s => s.status = status);
  }

  submitBatchAttendance(): void {
    if (!this.batchCourse || !this.batchDate) {
      this.notificationService.warning('Select course and date.');
      return;
    }

    this.isSubmittingBatch = true;
    this.attendanceService.createBulk({
      course: this.batchCourse,
      date: this.batchDate,
      records: this.batchStudents
    }).subscribe({
      next: (res: any) => {
        this.isSubmittingBatch = false;
        this.isBatchModalOpen = false;
        this.notificationService.success(res.message || 'Class attendance recorded successfully.');
        this.loadRecords();
        if (this.activeTab === 'summary') this.loadSummary();
      },
      error: (err) => {
        this.isSubmittingBatch = false;
        this.notificationService.error(err.error?.message || 'Error recording attendance.');
      }
    });
  }

  confirmDelete(record: Attendance): void {
    this.recordToDelete = record;
    this.isDeleteDialogOpen = true;
  }

  executeDelete(): void {
    if (!this.recordToDelete) return;
    const target = this.recordToDelete;
    this.attendanceService.delete(target.id).subscribe({
      next: (res) => {
        this.isDeleteDialogOpen = false;
        this.recordToDelete = null;
        this.notificationService.success('Attendance record deleted.');
        this.loadRecords();
        if (this.activeTab === 'summary') this.loadSummary();
      },
      error: (err) => {
        this.isDeleteDialogOpen = false;
        this.notificationService.error(err.error?.message || 'Error deleting record.');
      }
    });
  }
}
