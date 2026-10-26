import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService } from '../core/services/students.service';
import { DepartmentsService } from '../core/services/departments.service';
import { Student, Department } from '../core/models/university.models';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <!-- Title & Action Header -->
      <div class="dashboard-banner">
        <div>
          <h1 class="page-title">Student Directory & Profiles</h1>
          <p class="page-subtitle" style="margin-bottom: 0;">
            Manage student registrations, academic standing, and department allocations.
          </p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="ri-user-add-line"></i>
          <span>Register New Student</span>
        </button>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="toolbar-container">
        <div class="search-box">
          <i class="ri-search-line"></i>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange()" 
            placeholder="Search by name, student ID, or email..." 
          />
        </div>

        <div class="filter-group">
          <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted);">Department:</label>
          <select class="filter-select" [(ngModel)]="selectedDepartment" (change)="loadStudents()">
            <option value="All">All Departments</option>
            @for (dept of departments; track dept.id) {
              <option [value]="dept.name">{{ dept.name }}</option>
            }
          </select>

          <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted); margin-left: 0.5rem;">Year:</label>
          <select class="filter-select" [(ngModel)]="selectedYear" (change)="loadStudents()">
            <option value="All">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>Loading student records...</p>
        </div>
      } @else if (students.length === 0) {
        <div class="card">
          <div class="empty-state">
            <i class="ri-user-unfollow-line"></i>
            <h3>No Students Found</h3>
            <p>No student matches your current filter criteria. Try adjusting your search query or add a new student.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="ri-user-add-line"></i> Register First Student
            </button>
          </div>
        </div>
      } @else {
        <!-- Students Responsive Table -->
        <div class="table-responsive">
          <table class="table-modern">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Profile</th>
                <th>Department</th>
                <th>Academic Level</th>
                <th>Phone</th>
                <th>Enrollment Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (student of students; track student.id) {
                <tr>
                  <td>
                    <span class="id-pill">{{ student.id }}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">
                      {{ student.name }}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
                      <i class="ri-mail-line"></i> {{ student.email }}
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-primary">{{ student.department }}</span>
                  </td>
                  <td>
                    <span class="badge badge-slate">{{ student.year }}</span>
                  </td>
                  <td>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">
                      {{ student.phone || 'N/A' }}
                    </span>
                  </td>
                  <td>
                    <span style="font-family: var(--font-mono); font-size: 0.825rem;">
                      {{ student.enrollmentDate }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions" style="justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" title="View Full Profile" (click)="viewDetails(student)">
                        <i class="ri-eye-line"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" title="Edit Student" (click)="openEditModal(student)">
                        <i class="ri-edit-line"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" title="Delete Student" (click)="confirmDelete(student)">
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

    <!-- Student Add / Edit Modal -->
    @if (isModalOpen) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <i [ngClass]="isEditing ? 'ri-edit-line' : 'ri-user-add-line'" style="color: var(--primary-600);"></i>
              {{ isEditing ? 'Edit Student Details' : 'Register New Student' }}
            </div>
            <button class="modal-close" (click)="closeModal()">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveStudent()" #studentForm="ngForm">
            <div class="modal-body">
              <div class="form-grid">
                <!-- Full Name -->
                <div class="form-group form-full">
                  <label class="form-label">Full Name <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.name" 
                    name="name" 
                    required 
                    #nameCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted) }"
                    placeholder="e.g. Eleanor Vance"
                  />
                  @if (nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted)) {
                    <span class="error-text">Student full name is required.</span>
                  }
                </div>

                <!-- Email Address -->
                <div class="form-group">
                  <label class="form-label">Email Address <span class="required">*</span></label>
                  <input 
                    type="email" 
                    class="form-control" 
                    [(ngModel)]="formData.email" 
                    name="email" 
                    required 
                    email
                    #emailCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched || formSubmitted) }"
                    placeholder="student@university.edu"
                  />
                  @if (emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched || formSubmitted)) {
                    <span class="error-text">Valid university email address is required.</span>
                  }
                </div>

                <!-- Phone Number -->
                <div class="form-group">
                  <label class="form-label">Phone Number <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.phone" 
                    name="phone" 
                    required 
                    #phoneCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': phoneCtrl.invalid && (phoneCtrl.dirty || phoneCtrl.touched || formSubmitted) }"
                    placeholder="+1-555-0199"
                  />
                  @if (phoneCtrl.invalid && (phoneCtrl.dirty || phoneCtrl.touched || formSubmitted)) {
                    <span class="error-text">Phone number is required.</span>
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
                    <span class="error-text">Please select a department.</span>
                  }
                </div>

                <!-- Year of Study -->
                <div class="form-group">
                  <label class="form-label">Academic Year <span class="required">*</span></label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="formData.year" 
                    name="year" 
                    required
                    #yearCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': yearCtrl.invalid && (yearCtrl.dirty || yearCtrl.touched || formSubmitted) }"
                  >
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  @if (yearCtrl.invalid && (yearCtrl.dirty || yearCtrl.touched || formSubmitted)) {
                    <span class="error-text">Please choose study year.</span>
                  }
                </div>

                <!-- Enrollment Date -->
                <div class="form-group form-full">
                  <label class="form-label">Enrollment Date <span class="required">*</span></label>
                  <input 
                    type="date" 
                    class="form-control" 
                    [(ngModel)]="formData.enrollmentDate" 
                    name="enrollmentDate" 
                    required
                    #dateCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': dateCtrl.invalid && (dateCtrl.dirty || dateCtrl.touched || formSubmitted) }"
                  />
                  @if (dateCtrl.invalid && (dateCtrl.dirty || dateCtrl.touched || formSubmitted)) {
                    <span class="error-text">Valid enrollment date is required.</span>
                  }
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                @if (isSubmitting) {
                  <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                }
                {{ isEditing ? 'Save Changes' : 'Confirm Registration' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Student Details Modal -->
    @if (detailsStudent) {
      <div class="modal-backdrop" (click)="detailsStudent = null">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header" style="background: linear-gradient(135deg, var(--primary-700), var(--primary-900)); color: white;">
            <div class="modal-title" style="color: white;">
              <i class="ri-user-smile-fill"></i>
              Student Profile Card
            </div>
            <button class="modal-close" style="color: white;" (click)="detailsStudent = null">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="modal-body">
            <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-100); color: var(--primary-700); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                <i class="ri-user-3-line"></i>
              </div>
              <div>
                <h3 style="font-size: 1.35rem; color: var(--text-main);">{{ detailsStudent.name }}</h3>
                <span class="id-pill">{{ detailsStudent.id }}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">EMAIL</div>
                <div style="font-size: 0.875rem; font-weight: 600;">{{ detailsStudent.email }}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">PHONE</div>
                <div style="font-size: 0.875rem; font-weight: 600;">{{ detailsStudent.phone || 'Not provided' }}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">DEPARTMENT</div>
                <div style="font-size: 0.875rem; font-weight: 600; color: var(--primary-600);">{{ detailsStudent.department }}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ACADEMIC LEVEL</div>
                <div style="font-size: 0.875rem; font-weight: 600;">{{ detailsStudent.year }}</div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">OFFICIAL ENROLLMENT DATE</div>
                <div style="font-size: 0.875rem; font-weight: 600; font-family: var(--font-mono);">{{ detailsStudent.enrollmentDate }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="detailsStudent = null">Close</button>
            <button class="btn btn-primary" (click)="openEditModal(detailsStudent); detailsStudent = null">
              <i class="ri-edit-line"></i> Edit Information
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Student Record"
      message="Are you sure you want to permanently delete this student record? This cannot be undone."
      [itemName]="studentToDelete ? studentToDelete.name + ' (' + studentToDelete.id + ')' : ''"
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

    .id-pill {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary-700);
      background: var(--primary-50);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      display: inline-block;
    }
  `]
})
export class StudentsComponent implements OnInit {
  private studentsService = inject(StudentsService);
  private departmentsService = inject(DepartmentsService);
  private notificationService = inject(NotificationService);

  students: Student[] = [];
  departments: Department[] = [];
  isLoading = true;
  isSubmitting = false;

  searchQuery = '';
  selectedDepartment = 'All';
  selectedYear = 'All';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingStudentId = '';
  formSubmitted = false;
  detailsStudent: Student | null = null;

  // Delete Dialog State
  isDeleteDialogOpen = false;
  studentToDelete: Student | null = null;

  formData: {
    name: string;
    email: string;
    phone: string;
    department: string;
    year: string;
    enrollmentDate: string;
  } = {
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    enrollmentDate: ''
  };

  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.loadDepartments();
    this.loadStudents();
  }

  loadDepartments(): void {
    this.departmentsService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.departments = res.data;
        }
      }
    });
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentsService.getAll({
      search: this.searchQuery,
      department: this.selectedDepartment,
      year: this.selectedYear
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.students = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.message || 'Failed to load students.');
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadStudents();
    }, 300);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingStudentId = '';
    this.formSubmitted = false;
    this.formData = {
      name: '',
      email: '',
      phone: '',
      department: this.departments.length > 0 ? this.departments[0].name : '',
      year: '1st Year',
      enrollmentDate: new Date().toISOString().split('T')[0]
    };
    this.isModalOpen = true;
  }

  openEditModal(student: Student): void {
    this.isEditing = true;
    this.editingStudentId = student.id;
    this.formSubmitted = false;
    this.formData = {
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      year: student.year,
      enrollmentDate: student.enrollmentDate
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formSubmitted = false;
  }

  saveStudent(): void {
    this.formSubmitted = true;
    if (!this.formData.name || !this.formData.email || !this.formData.department || !this.formData.year || !this.formData.enrollmentDate) {
      return;
    }

    this.isSubmitting = true;

    if (this.isEditing) {
      this.studentsService.update(this.editingStudentId, this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Student updated successfully.');
          this.loadStudents();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error updating student.');
        }
      });
    } else {
      this.studentsService.create(this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Student registered successfully.');
          this.loadStudents();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error registering student.');
        }
      });
    }
  }

  viewDetails(student: Student): void {
    this.detailsStudent = student;
  }

  confirmDelete(student: Student): void {
    this.studentToDelete = student;
    this.isDeleteDialogOpen = true;
  }

  executeDelete(): void {
    if (!this.studentToDelete) return;
    const target = this.studentToDelete;
    this.studentsService.delete(target.id).subscribe({
      next: (res) => {
        this.isDeleteDialogOpen = false;
        this.studentToDelete = null;
        this.notificationService.success(res.message || `Student ${target.name} removed successfully.`);
        this.loadStudents();
      },
      error: (err) => {
        this.isDeleteDialogOpen = false;
        this.notificationService.error(err.error?.message || 'Error deleting student.');
      }
    });
  }
}
