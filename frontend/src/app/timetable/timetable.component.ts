import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetableService } from '../core/services/timetable.service';
import { CoursesService } from '../core/services/courses.service';
import { FacultyService } from '../core/services/faculty.service';
import { DepartmentsService } from '../core/services/departments.service';
import { Timetable, Course, Faculty, Department } from '../core/models/university.models';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <!-- Title & Action Header -->
      <div class="dashboard-banner">
        <div>
          <h1 class="page-title">Campus Lecture & Lab Timetable</h1>
          <p class="page-subtitle" style="margin-bottom: 0;">
            Schedule classroom lectures with automated conflict prevention for rooms and faculty instructors.
          </p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="ri-calendar-event-line"></i>
          <span>Schedule Class Slot</span>
        </button>
      </div>

      <!-- Filters & Days Tabs -->
      <div class="toolbar-container" style="flex-direction: column; align-items: stretch; gap: 1rem;">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
          <!-- Day Tabs -->
          <div class="day-pills">
            @for (day of daysOfWeek; track day) {
              <button 
                class="day-pill" 
                [ngClass]="{ 'active': selectedDay === day }"
                (click)="selectDay(day)"
              >
                {{ day }}
              </button>
            }
          </div>

          <div class="filter-group">
            <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted);">Department:</label>
            <select class="filter-select" [(ngModel)]="selectedDepartment" (change)="loadTimetable()">
              <option value="All">All Departments</option>
              @for (dept of departments; track dept.id) {
                <option [value]="dept.name">{{ dept.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>Loading timetable schedule...</p>
        </div>
      } @else if (timetableEntries.length === 0) {
        <div class="card">
          <div class="empty-state">
            <i class="ri-calendar-close-line"></i>
            <h3>No Scheduled Classes</h3>
            <p>No lectures or lab sessions are scheduled for {{ selectedDay === 'All' ? 'any day' : selectedDay }} in this filter.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="ri-calendar-event-line"></i> Schedule First Session
            </button>
          </div>
        </div>
      } @else {
        <!-- Timetable Table -->
        <div class="table-responsive">
          <table class="table-modern">
            <thead>
              <tr>
                <th>Day & Time</th>
                <th>Course / Subject</th>
                <th>Room / Venue</th>
                <th>Instructor (Faculty)</th>
                <th>Department</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of timetableEntries; track entry.id) {
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">
                      {{ entry.day }}
                    </div>
                    <div class="time-range">
                      <i class="ri-time-line"></i> {{ entry.startTime }} - {{ entry.endTime }}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--primary-700); font-size: 0.95rem;">
                      {{ entry.course }}
                    </div>
                    <div style="font-size: 0.725rem; color: var(--text-muted);">Slot ID: {{ entry.id }}</div>
                  </td>
                  <td>
                    <span class="room-pill">
                      <i class="ri-community-line"></i> {{ entry.room }}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.875rem;">{{ entry.faculty }}</div>
                  </td>
                  <td>
                    <span class="badge badge-primary">{{ entry.department }}</span>
                  </td>
                  <td>
                    <div class="table-actions" style="justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" title="Edit Schedule Slot" (click)="openEditModal(entry)">
                        <i class="ri-edit-line"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" title="Remove Slot" (click)="confirmDelete(entry)">
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
    </div>

    <!-- Timetable Add / Edit Modal -->
    @if (isModalOpen) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <i [ngClass]="isEditing ? 'ri-edit-line' : 'ri-calendar-event-line'" style="color: var(--primary-600);"></i>
              {{ isEditing ? 'Edit Timetable Entry' : 'Schedule Timetable Entry' }}
            </div>
            <button class="modal-close" (click)="closeModal()">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveTimetable()" #timetableForm="ngForm">
            <div class="modal-body">
              <div class="form-grid">
                <!-- Day of Week -->
                <div class="form-group">
                  <label class="form-label">Day of Week <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="formData.day" name="day" required>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <!-- Department -->
                <div class="form-group">
                  <label class="form-label">Department <span class="required">*</span></label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="formData.department" 
                    name="department" 
                    required 
                    (change)="onDepartmentChange()"
                  >
                    @for (dept of departments; track dept.id) {
                      <option [value]="dept.name">{{ dept.name }}</option>
                    }
                  </select>
                </div>

                <!-- Start Time -->
                <div class="form-group">
                  <label class="form-label">Start Time <span class="required">*</span></label>
                  <input 
                    type="time" 
                    class="form-control" 
                    [(ngModel)]="formData.startTime" 
                    name="startTime" 
                    required 
                  />
                </div>

                <!-- End Time -->
                <div class="form-group">
                  <label class="form-label">End Time <span class="required">*</span></label>
                  <input 
                    type="time" 
                    class="form-control" 
                    [(ngModel)]="formData.endTime" 
                    name="endTime" 
                    required 
                  />
                </div>

                <!-- Course -->
                <div class="form-group form-full">
                  <label class="form-label">Course / Subject <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="formData.course" name="course" required>
                    <option value="" disabled>Select Course</option>
                    @for (c of courses; track c.id) {
                      <option [value]="c.courseName">{{ c.courseCode }} — {{ c.courseName }}</option>
                    }
                  </select>
                </div>

                <!-- Faculty -->
                <div class="form-group">
                  <label class="form-label">Faculty Instructor <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="formData.faculty" name="faculty" required>
                    <option value="" disabled>Select Instructor</option>
                    @for (fac of facultyList; track fac.id) {
                      <option [value]="fac.name">{{ fac.name }} ({{ fac.department }})</option>
                    }
                  </select>
                </div>

                <!-- Room / Venue -->
                <div class="form-group">
                  <label class="form-label">Room / Lab <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.room" 
                    name="room" 
                    required 
                    placeholder="e.g. Room 301, Lab 2, Hall A"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                @if (isSubmitting) {
                  <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                }
                {{ isEditing ? 'Update Slot' : 'Confirm Schedule' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Timetable Slot"
      message="Are you sure you want to remove this timetable slot?"
      [itemName]="slotToDelete ? slotToDelete.course + ' on ' + slotToDelete.day + ' (' + slotToDelete.startTime + ' - ' + slotToDelete.endTime + ')' : ''"
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

    .day-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .day-pill {
      background: var(--bg-card-alt);
      border: 1px solid var(--border-subtle);
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .day-pill:hover {
      background: #e2e8f0;
      color: var(--text-main);
    }

    .day-pill.active {
      background: var(--primary-600);
      border-color: var(--primary-600);
      color: white;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
    }

    .time-range {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }

    .room-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #f1f5f9;
      color: #334155;
      font-size: 0.825rem;
      font-weight: 600;
      padding: 0.25rem 0.55rem;
      border-radius: var(--radius-sm);
      border: 1px solid #cbd5e1;
    }
  `]
})
export class TimetableComponent implements OnInit {
  private timetableService = inject(TimetableService);
  private coursesService = inject(CoursesService);
  private facultyService = inject(FacultyService);
  private departmentsService = inject(DepartmentsService);
  private notificationService = inject(NotificationService);

  timetableEntries: Timetable[] = [];
  courses: Course[] = [];
  facultyList: Faculty[] = [];
  departments: Department[] = [];

  isLoading = true;
  isSubmitting = false;

  daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedDay = 'All';
  selectedDepartment = 'All';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingSlotId = '';

  // Delete State
  isDeleteDialogOpen = false;
  slotToDelete: Timetable | null = null;

  formData: {
    day: string;
    startTime: string;
    endTime: string;
    course: string;
    faculty: string;
    room: string;
    department: string;
  } = {
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    course: '',
    faculty: '',
    room: '',
    department: ''
  };

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadTimetable();
  }

  loadDropdowns(): void {
    this.departmentsService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.departments = res.data;
          if (this.departments.length > 0 && !this.formData.department) {
            this.formData.department = this.departments[0].name;
          }
        }
      }
    });

    this.coursesService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.courses = res.data; }
    });

    this.facultyService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.facultyList = res.data; }
    });
  }

  loadTimetable(): void {
    this.isLoading = true;
    this.timetableService.getAll({
      day: this.selectedDay,
      department: this.selectedDepartment
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.timetableEntries = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.message || 'Failed to load timetable.');
      }
    });
  }

  selectDay(day: string): void {
    this.selectedDay = day;
    this.loadTimetable();
  }

  onDepartmentChange(): void {
    // Optionally filter courses by department
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingSlotId = '';
    this.formData = {
      day: this.selectedDay !== 'All' ? this.selectedDay : 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      course: this.courses.length > 0 ? this.courses[0].courseName : '',
      faculty: this.facultyList.length > 0 ? this.facultyList[0].name : '',
      room: 'Room 101',
      department: this.departments.length > 0 ? this.departments[0].name : ''
    };
    this.isModalOpen = true;
  }

  openEditModal(slot: Timetable): void {
    this.isEditing = true;
    this.editingSlotId = slot.id;
    this.formData = {
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      course: slot.course,
      faculty: slot.faculty,
      room: slot.room,
      department: slot.department
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveTimetable(): void {
    if (!this.formData.day || !this.formData.startTime || !this.formData.endTime || !this.formData.course || !this.formData.faculty || !this.formData.room) {
      this.notificationService.warning('Please fill in all timetable slot fields.');
      return;
    }

    if (this.formData.startTime >= this.formData.endTime) {
      this.notificationService.error('Start time must be strictly before End time.');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditing) {
      this.timetableService.update(this.editingSlotId, this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Timetable slot updated successfully.');
          this.loadTimetable();
        },
        error: (err) => {
          this.isSubmitting = false;
          // Display the conflict error directly to user
          this.notificationService.error(err.error?.message || 'Schedule conflict detected. Please verify room/faculty availability.');
        }
      });
    } else {
      this.timetableService.create(this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Class scheduled successfully.');
          this.loadTimetable();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Schedule conflict detected.');
        }
      });
    }
  }

  confirmDelete(slot: Timetable): void {
    this.slotToDelete = slot;
    this.isDeleteDialogOpen = true;
  }

  executeDelete(): void {
    if (!this.slotToDelete) return;
    const target = this.slotToDelete;
    this.timetableService.delete(target.id).subscribe({
      next: (res) => {
        this.isDeleteDialogOpen = false;
        this.slotToDelete = null;
        this.notificationService.success(res.message || 'Timetable slot deleted.');
        this.loadTimetable();
      },
      error: (err) => {
        this.isDeleteDialogOpen = false;
        this.notificationService.error(err.error?.message || 'Error deleting timetable slot.');
      }
    });
  }
}
