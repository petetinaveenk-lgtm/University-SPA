import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentsService } from '../core/services/departments.service';
import { Department } from '../core/models/university.models';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <!-- Title & Action Header -->
      <div class="dashboard-banner">
        <div>
          <h1 class="page-title">Academic Departments & Schools</h1>
          <p class="page-subtitle" style="margin-bottom: 0;">
            Configure faculties, academic divisions, school codes, and institutional descriptions.
          </p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="ri-building-4-line"></i>
          <span>Add New Department</span>
        </button>
      </div>

      <!-- Search Toolbar -->
      <div class="toolbar-container">
        <div class="search-box">
          <i class="ri-search-line"></i>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange()" 
            placeholder="Search departments by name or abbreviation..." 
          />
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>Loading departments...</p>
        </div>
      } @else if (departments.length === 0) {
        <div class="card">
          <div class="empty-state">
            <i class="ri-community-line"></i>
            <h3>No Departments Configured</h3>
            <p>Establish your university's departments to organize courses, faculty, and students.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="ri-building-4-line"></i> Add First Department
            </button>
          </div>
        </div>
      } @else {
        <!-- Departments Grid Cards & Table -->
        <div class="dept-grid">
          @for (dept of departments; track dept.id) {
            <div class="dept-card">
              <div class="dept-header">
                <div class="dept-icon-box">
                  <i class="ri-building-2-fill"></i>
                </div>
                <div style="flex: 1;">
                  <span class="code-pill">{{ dept.code || 'DEPT' }}</span>
                  <div class="dept-title">{{ dept.name }}</div>
                  <div class="dept-id">Ref: {{ dept.id }}</div>
                </div>
              </div>

              <div class="dept-body">
                <p class="dept-desc">
                  {{ dept.description || 'No formal description provided for this academic department.' }}
                </p>
              </div>

              <div class="dept-footer">
                <div class="table-actions" style="width: 100%; justify-content: flex-end;">
                  <button class="btn btn-secondary btn-sm" (click)="openEditModal(dept)">
                    <i class="ri-edit-line"></i> Edit
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(dept)">
                    <i class="ri-delete-bin-line"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Department Add / Edit Modal -->
    @if (isModalOpen) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <i [ngClass]="isEditing ? 'ri-edit-line' : 'ri-building-4-line'" style="color: var(--primary-600);"></i>
              {{ isEditing ? 'Edit Department' : 'Establish New Department' }}
            </div>
            <button class="modal-close" (click)="closeModal()">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveDepartment()" #deptForm="ngForm">
            <div class="modal-body">
              <div class="form-grid">
                <!-- Department Name -->
                <div class="form-group form-full">
                  <label class="form-label">Department Name <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.name" 
                    name="name" 
                    required 
                    #nameCtrl="ngModel"
                    [ngClass]="{ 'is-invalid': nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted) }"
                    placeholder="e.g. Electrical & Computer Engineering"
                  />
                  @if (nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched || formSubmitted)) {
                    <span class="error-text">Department name is required. Duplicate names not allowed.</span>
                  }
                </div>

                <!-- Code / Abbreviation -->
                <div class="form-group">
                  <label class="form-label">Abbreviation / Code</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.code" 
                    name="code" 
                    placeholder="e.g. ECE or CSE"
                  />
                </div>

                <!-- Description -->
                <div class="form-group form-full">
                  <label class="form-label">Description & Scope</label>
                  <textarea 
                    rows="3" 
                    class="form-control" 
                    [(ngModel)]="formData.description" 
                    name="description" 
                    placeholder="Provide overview of curriculum, research laboratories, and programs..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                @if (isSubmitting) {
                  <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                }
                {{ isEditing ? 'Save Changes' : 'Create Department' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Department"
      message="Are you sure you want to delete this department? Associated faculty or courses may need re-assignment."
      [itemName]="deptToDelete ? deptToDelete.name : ''"
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

    .dept-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .dept-card {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: all var(--transition-fast);
      overflow: hidden;
    }

    .dept-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .dept-header {
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border-bottom: 1px solid var(--border-subtle);
      background: #fafafa;
    }

    .dept-icon-box {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-600), var(--accent-purple));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
    }

    .dept-title {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      margin-top: 0.25rem;
      line-height: 1.2;
    }

    .dept-id {
      font-family: var(--font-mono);
      font-size: 0.725rem;
      color: var(--text-subtle);
      margin-top: 2px;
    }

    .code-pill {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
      color: #92400e;
      background: #fef3c7;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
      display: inline-block;
    }

    .dept-body {
      padding: 1.25rem;
      flex: 1;
    }

    .dept-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .dept-footer {
      padding: 0.85rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
      background: #f8fafc;
    }
  `]
})
export class DepartmentsComponent implements OnInit {
  private departmentsService = inject(DepartmentsService);
  private notificationService = inject(NotificationService);

  departments: Department[] = [];
  isLoading = true;
  isSubmitting = false;
  searchQuery = '';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingDeptId = '';
  formSubmitted = false;

  // Delete State
  isDeleteDialogOpen = false;
  deptToDelete: Department | null = null;

  formData = {
    name: '',
    code: '',
    description: ''
  };

  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentsService.getAll(this.searchQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.departments = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.message || 'Failed to load departments.');
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadDepartments();
    }, 300);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingDeptId = '';
    this.formSubmitted = false;
    this.formData = {
      name: '',
      code: '',
      description: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(dept: Department): void {
    this.isEditing = true;
    this.editingDeptId = dept.id;
    this.formSubmitted = false;
    this.formData = {
      name: dept.name,
      code: dept.code,
      description: dept.description
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formSubmitted = false;
  }

  saveDepartment(): void {
    this.formSubmitted = true;
    if (!this.formData.name || !this.formData.name.trim()) {
      return;
    }

    this.isSubmitting = true;

    if (this.isEditing) {
      this.departmentsService.update(this.editingDeptId, this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Department updated successfully.');
          this.loadDepartments();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error updating department.');
        }
      });
    } else {
      this.departmentsService.create(this.formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal();
          this.notificationService.success(res.message || 'Department created successfully.');
          this.loadDepartments();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notificationService.error(err.error?.message || 'Error creating department.');
        }
      });
    }
  }

  confirmDelete(dept: Department): void {
    this.deptToDelete = dept;
    this.isDeleteDialogOpen = true;
  }

  executeDelete(): void {
    if (!this.deptToDelete) return;
    const target = this.deptToDelete;
    this.departmentsService.delete(target.id).subscribe({
      next: (res) => {
        this.isDeleteDialogOpen = false;
        this.deptToDelete = null;
        this.notificationService.success(res.message || `Department ${target.name} deleted.`);
        this.loadDepartments();
      },
      error: (err) => {
        this.isDeleteDialogOpen = false;
        this.notificationService.error(err.error?.message || 'Error deleting department.');
      }
    });
  }
}
