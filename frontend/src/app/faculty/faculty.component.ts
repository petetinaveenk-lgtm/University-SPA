import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacultyService } from '../core/services/faculty.service';
import { DepartmentsService } from '../core/services/departments.service';
import { Faculty, Department } from '../core/models/university.models';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-faculty',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <!-- Title & Action Header -->
      <div class="dashboard-banner">
        <div>
          <h1 class="page-title">Faculty & Academic Staff</h1>
          <p class="page-subtitle" style="margin-bottom: 0;">
            Manage university professors, instructors, department heads, and academic designations.
          </p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="ri-user-add-line"></i>
          <span>Appoint New Faculty</span>
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
            placeholder="Search faculty by name, ID or designation..." 
          />
        </div>

        <div class="filter-group">
          <label style="font-size: 0.825rem; font-weight: 600; color: var(--text-muted);">Department:</label>
          <select class="filter-select" [(ngModel)]="selectedDepartment" (change)="loadFaculty()">
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
          <p>Loading faculty records...</p>
        </div>
      } @else if (facultyList.length === 0) {
        <div class="card">
          <div class="empty-state">
            <i class="ri-team-line"></i>
            <h3>No Faculty Records Found</h3>
            <p>No faculty members match your filter criteria. Try adjusting the search or add a new faculty member.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="ri-user-add-line"></i> Appoint First Faculty Member
            </button>
          </div>
        </div>
      } @else {
        <!-- Responsive Faculty Table -->
        <div class="table-responsive">
          <table class="table-modern">
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Staff Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email Contact</th>
                <th>Phone</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (faculty of facultyList; track faculty.id) {
                <tr>
                  <td>
                    <span class="id-pill">{{ faculty.id }}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">
                      {{ faculty.name }}
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-primary">{{ faculty.department }}</span>
                  </td>
                  <td>
                    <span class="badge badge-info">{{ faculty.designation }}</span>
                  </td>
                  <td>
                    <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
                      <i class="ri-mail-line"></i> {{ faculty.email }}
                    </div>
                  </td>
                  <td>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">
                      {{ faculty.phone || 'N/A' }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions" style="justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" title="Edit Faculty" (click)="openEditModal(faculty)">
                        <i class="ri-edit-line"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" title="Delete Faculty" (click)="confirmDelete(faculty)">
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

    <!-- Faculty Add / Edit Modal -->
    @if (isModalOpen) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <i [ngClass]="isEditing ? 'ri-edit-line' : 'ri-user-add-line'" style="color: var(--primary-600);"></i>
              {{ isEditing ? 'Edit Faculty Details' : 'Appoint New Faculty Member' }}
            </div>
            <button class="modal-close" (click)="closeModal()">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveFaculty()" #facultyForm="ngForm">
            <div class="modal-body">
              <div class="form-grid">
                <!-- Full Name -->
                <div class="form-group form-full">
                  <label class="form-label">Full Name & Title <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.name" 
                    name="name" 
                    required 
                    #nameCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted) }"
                    placeholder="e.g. Dr. Alan Turing"
                  />
                  @if (nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted)) {
                    <span class="error-text">Faculty name is required.</span>
                  }
                </div>

                <!-- Email -->
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
                    placeholder="faculty@university.edu"
                  />
                  @if (emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched || formSubmitted)) {
                    <span class="error-text">Valid university email address is required.</span>
                  }
                </div>

                <!-- Phone -->
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
                    placeholder="+1-555-0101"
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
                    <span class="error-text">Please assign a department.</span>
                  }
                </div>

                <!-- Designation -->
                <div class="form-group">
                  <label class="form-label">Designation <span class="required">*</span></label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="formData.designation" 
                    name="designation" 
                    required
                    #desigCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': desigCtrl.invalid && (desigCtrl.dirty || desigCtrl.touched || formSubmitted) }"
                  >
                    <option value="" disabled>Select Designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Department Chair">Department Chair</option>
                  </select>
                  @if (desigCtrl.invalid && (desigCtrl.dirty || desigCtrl.touched || formSubmitted)) {
                    <span class="error-text">Designation is required.</span>
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
                {{ isEditing ? 'Update Faculty' : 'Save Faculty Record' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Faculty Member"
      message="Are you sure you want to remove this faculty member from the directory?"
      [itemName]="facultyToDelete ? facultyToDelete.name + ' (' + facultyToDelete.designation + ')' : ''"
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
      color: #0891b2;
      background: #cffafe;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      display: inline-block;
    }
  `]
})
export class FacultyComponent implements OnInit {
  private facultyService = inject(FacultyService);
  private departmentsService = inject(DepartmentsService);
  private notificationService = inject(NotificationService);

  facultyList: Faculty[] = [];
  departments: Department[] = [];
  isLoading = true;
  isSubmitting = false;

  searchQuery = '';
  selectedDepartment = 'All';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingFacultyId = '';
  formSubmitted = false;

  // Delete State
  isDeleteDialogOpen = false;
  facultyToDelete: Faculty | null = null;

  formData: {
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
  } = {
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: ''
  };

  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.loadDepartments();
    this.loadFaculty();
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

  loadFaculty(): void {
    this.isLoading = true;
    this.facultyService.getAll({
      search: this.searchQuery,
      department: this.selectedDepartment
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.facultyList = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.message || 'Failed to load faculty list.');
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadFaculty();
    }, 300);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingFacultyId = '';
    this.formSubmitted = false;
    this.formData = {
      name: '',
      email: '',
      phone: '',
      department: this.departments.length > 0 ? this.departments[0].name : '',
      designation: 'Assistant Professor'
    };
    this.isModalOpen = true;
  }

  openEditModal(faculty: Faculty): void {
    this.isEditing = true;
    this.editingFacultyId = faculty.id;
    this.formSubmitted = false;
    this.formData = {
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone,
      department: faculty.department,
      designation: faculty.designation
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formSubmitted = false;
  }

  saveFaculty(): void {
    this.formSubmitted = true;
    if (!this.formData.name || !this.formData.email || !this.formData.department || !this.formData.designation) {
      return;
    }

    this.isSubmitting = true;

    if (this.isEditing) {
      this.facultyService.update(this.editingFacultyId, this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Faculty member updated.');
          this.loadFaculty();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error updating faculty member.');
        }
      });
    } else {
      this.facultyService.create(this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Faculty member appointed successfully.');
          this.loadFaculty();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error creating faculty record.');
        }
      });
    }
  }

  confirmDelete(faculty: Faculty): void {
    this.facultyToDelete = faculty;
    this.isDeleteDialogOpen = true;
  }

  executeDelete(): void {
    if (!this.facultyToDelete) return;
    const target = this.facultyToDelete;
    this.facultyService.delete(target.id).subscribe({
      next: (res) => {
        this.isDeleteDialogOpen = false;
        this.facultyToDelete = null;
        this.notificationService.success(res.message || `Faculty member ${target.name} deleted.`);
        this.loadFaculty();
      },
      error: (err) => {
        this.isDeleteDialogOpen = false;
        this.notificationService.error(err.error?.message || 'Error deleting faculty member.');
      }
    });
  }
}
