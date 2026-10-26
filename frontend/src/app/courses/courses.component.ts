import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../core/services/courses.service';
import { DepartmentsService } from '../core/services/departments.service';
import { FacultyService } from '../core/services/faculty.service';
import { Course, Department, Faculty } from '../core/models/university.models';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <!-- Title & Action Header -->
      <div class="dashboard-banner">
        <div>
          <h1 class="page-title">Curriculum & Course Catalog</h1>
          <p class="page-subtitle" style="margin-bottom: 0;">
            Manage academic syllabus offerings, credit weights, department alignments, and instructor assignments.
          </p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="ri-book-open-line"></i>
          <span>Create New Course</span>
        </button>
      </div>

      <!-- Search & Department Filter Toolbar -->
      <div class="toolbar-container">
        <div class="search-box">
          <i class="ri-search-line"></i>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange()" 
            placeholder="Search by course code, name or assigned faculty..." 
          />
        </div>

        <div class="filter-group">
          <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted);">Department:</label>
          <select class="filter-select" [(ngModel)]="selectedDepartment" (change)="loadCourses()">
            <option value="All">All Departments</option>
            @for (dept of departments; track dept.id) {
              <option [value]="dept.name">{{ dept.name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>Loading course catalog...</p>
        </div>
      } @else if (courses.length === 0) {
        <div class="card">
          <div class="empty-state">
            <i class="ri-book-2-line"></i>
            <h3>No Courses Available</h3>
            <p>No courses match your filter. You can add a new syllabus course to the university catalog.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="ri-book-open-line"></i> Create First Course
            </button>
          </div>
        </div>
      } @else {
        <!-- Courses Responsive Table -->
        <div class="table-responsive">
          <table class="table-modern">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Department</th>
                <th>Credit Units</th>
                <th>Assigned Faculty</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (course of courses; track course.id) {
                <tr>
                  <td>
                    <span class="code-pill">{{ course.courseCode }}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">
                      {{ course.courseName }}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">ID: {{ course.id }}</div>
                  </td>
                  <td>
                    <span class="badge badge-primary">{{ course.department }}</span>
                  </td>
                  <td>
                    <span class="credits-badge">
                      <i class="ri-medal-line"></i> {{ course.credits }} Credits
                    </span>
                  </td>
                  <td>
                    <div style="font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.4rem;">
                      <i class="ri-user-star-line" style="color: var(--primary-600);"></i>
                      {{ course.facultyAssigned || 'Unassigned' }}
                    </div>
                  </td>
                  <td>
                    <div class="table-actions" style="justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" title="Edit Course" (click)="openEditModal(course)">
                        <i class="ri-edit-line"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" title="Delete Course" (click)="confirmDelete(course)">
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

    <!-- Course Add / Edit Modal -->
    @if (isModalOpen) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <i [ngClass]="isEditing ? 'ri-edit-line' : 'ri-book-open-line'" style="color: var(--primary-600);"></i>
              {{ isEditing ? 'Edit Course Details' : 'Add Course to Curriculum' }}
            </div>
            <button class="modal-close" (click)="closeModal()">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveCourse()" #courseForm="ngForm">
            <div class="modal-body">
              <div class="form-grid">
                <!-- Course Code -->
                <div class="form-group">
                  <label class="form-label">Course Code <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.courseCode" 
                    name="courseCode" 
                    required 
                    #codeCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': codeCtrl.invalid && (codeCtrl.dirty || codeCtrl.touched || formSubmitted) }"
                    placeholder="e.g. CS101 or CS302"
                  />
                  @if (codeCtrl.invalid && (codeCtrl.dirty || codeCtrl.touched || formSubmitted)) {
                    <span class="error-text">Course code is required.</span>
                  }
                </div>

                <!-- Credits -->
                <div class="form-group">
                  <label class="form-label">Credit Units <span class="required">*</span></label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    class="form-control" 
                    [(ngModel)]="formData.credits" 
                    name="credits" 
                    required 
                    #creditsCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': creditsCtrl.invalid && (creditsCtrl.dirty || creditsCtrl.touched || formSubmitted) }"
                    placeholder="e.g. 3 or 4"
                  />
                  @if (creditsCtrl.invalid && (creditsCtrl.dirty || creditsCtrl.touched || formSubmitted)) {
                    <span class="error-text">Credits must be 1 to 10.</span>
                  }
                </div>

                <!-- Course Title -->
                <div class="form-group form-full">
                  <label class="form-label">Course Title <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.courseName" 
                    name="courseName" 
                    required 
                    #nameCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted) }"
                    placeholder="e.g. Advanced Operating Systems"
                  />
                  @if (nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted)) {
                    <span class="error-text">Course title is required.</span>
                  }
                </div>

                <!-- Department -->
                <div class="form-group">
                  <label class="form-label">Department <span class="required">*</span></label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="formData.department" 
                    name="department" 
                    required
                    #deptCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': deptCtrl.invalid && (deptCtrl.dirty || deptCtrl.touched || formSubmitted) }"
                  >
                    <option value="" disabled>Select Department</option>
                    @for (dept of departments; track dept.id) {
                      <option [value]="dept.name">{{ dept.name }}</option>
                    }
                  </select>
                  @if (deptCtrl.invalid && (deptCtrl.dirty || deptCtrl.touched || formSubmitted)) {
                    <span class="error-text">Please select department.</span>
                  }
                </div>

                <!-- Faculty Assigned -->
                <div class="form-group">
                  <label class="form-label">Assign Faculty Member</label>
                  <select class="form-control" [(ngModel)]="formData.facultyAssigned" name="facultyAssigned">
                    <option value="Unassigned">-- Select Instructor --</option>
                    @for (fac of facultyList; track fac.id) {
                      <option [value]="fac.name">{{ fac.name }} ({{ fac.designation }})</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                @if (isSubmitting) {
                  <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                }
                {{ isEditing ? 'Update Course' : 'Add Course' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Course"
      message="Are you sure you want to remove this course from the university curriculum catalog?"
      [itemName]="courseToDelete ? courseToDelete.courseCode + ' — ' + courseToDelete.courseName : ''"
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

    .code-pill {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 700;
      color: #6d28d9;
      background: #ede9fe;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      display: inline-block;
    }

    .credits-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.825rem;
      font-weight: 600;
      color: #1e293b;
      background: #f1f5f9;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }
  `]
})
export class CoursesComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private departmentsService = inject(DepartmentsService);
  private facultyService = inject(FacultyService);
  private notificationService = inject(NotificationService);

  courses: Course[] = [];
  departments: Department[] = [];
  facultyList: Faculty[] = [];
  isLoading = true;
  isSubmitting = false;

  searchQuery = '';
  selectedDepartment = 'All';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingCourseId = '';
  formSubmitted = false;

  // Delete State
  isDeleteDialogOpen = false;
  courseToDelete: Course | null = null;

  formData: {
    courseCode: string;
    courseName: string;
    department: string;
    credits: number;
    facultyAssigned: string;
  } = {
    courseCode: '',
    courseName: '',
    department: '',
    credits: 3,
    facultyAssigned: 'Unassigned'
  };

  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadCourses();
  }

  loadDropdowns(): void {
    this.departmentsService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.departments = res.data; }
    });
    this.facultyService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.facultyList = res.data; }
    });
  }

  loadCourses(): void {
    this.isLoading = true;
    this.coursesService.getAll({
      search: this.searchQuery,
      department: this.selectedDepartment
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.courses = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.message || 'Failed to load courses.');
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadCourses();
    }, 300);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingCourseId = '';
    this.formSubmitted = false;
    this.formData = {
      courseCode: '',
      courseName: '',
      department: this.departments.length > 0 ? this.departments[0].name : '',
      credits: 3,
      facultyAssigned: 'Unassigned'
    };
    this.isModalOpen = true;
  }

  openEditModal(course: Course): void {
    this.isEditing = true;
    this.editingCourseId = course.id;
    this.formSubmitted = false;
    this.formData = {
      courseCode: course.courseCode,
      courseName: course.courseName,
      department: course.department,
      credits: course.credits,
      facultyAssigned: course.facultyAssigned || 'Unassigned'
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formSubmitted = false;
  }

  saveCourse(): void {
    this.formSubmitted = true;
    if (!this.formData.courseCode || !this.formData.courseName || !this.formData.department || !this.formData.credits) {
      return;
    }

    this.isSubmitting = true;

    if (this.isEditing) {
      this.coursesService.update(this.editingCourseId, this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Course updated.');
          this.loadCourses();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error updating course.');
        }
      });
    } else {
      this.coursesService.create(this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Course created successfully.');
          this.loadCourses();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error creating course.');
        }
      });
    }
  }

  confirmDelete(course: Course): void {
    this.courseToDelete = course;
    this.isDeleteDialogOpen = true;
  }

  executeDelete(): void {
    if (!this.courseToDelete) return;
    const target = this.courseToDelete;
    this.coursesService.delete(target.id).subscribe({
      next: (res) => {
        this.isDeleteDialogOpen = false;
        this.courseToDelete = null;
        this.notificationService.success(res.message || `Course ${target.courseCode} deleted.`);
        this.loadCourses();
      },
      error: (err) => {
        this.isDeleteDialogOpen = false;
        this.notificationService.error(err.error?.message || 'Error deleting course.');
      }
    });
  }
}
