import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-dialog" style="max-width: 440px;" (click)="$event.stopPropagation()">
          <div class="modal-header" style="background: #fff1f2;">
            <div class="modal-title" style="color: #b91c1c;">
              <i class="ri-alarm-warning-line" style="font-size: 1.35rem;"></i>
              {{ title || 'Confirm Action' }}
            </div>
            <button class="modal-close" (click)="onCancel()">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="modal-body" style="padding: 1.5rem;">
            <p style="margin-bottom: 0.75rem; color: var(--text-main); font-size: 0.95rem;">
              {{ message || 'Are you sure you want to proceed with this deletion?' }}
            </p>
            @if (itemName) {
              <div style="background: #f8fafc; border: 1px dashed var(--border-subtle); padding: 0.75rem 1rem; border-radius: 8px; font-weight: 600; color: #0f172a;">
                "{{ itemName }}"
              </div>
            }
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.75rem;">
              This operation will permanently delete the record from the database.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            <button class="btn btn-danger" (click)="onConfirm()">
              <i class="ri-delete-bin-line"></i>
              {{ confirmText || 'Delete Permanently' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Deletion';
  @Input() message = 'Are you sure you want to delete this record? This action cannot be undone.';
  @Input() itemName = '';
  @Input() confirmText = 'Delete';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
