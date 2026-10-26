import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-item {{ toast.type }}" (click)="notificationService.dismiss(toast.id)">
          <i [ngClass]="{
            'ri-checkbox-circle-fill': toast.type === 'success',
            'ri-error-warning-fill': toast.type === 'error',
            'ri-alert-fill': toast.type === 'warning',
            'ri-information-fill': toast.type === 'info'
          }" style="font-size: 1.25rem;"></i>
          <div style="flex: 1;">
            @if (toast.title) {
              <div style="font-weight: 700; margin-bottom: 2px;">{{ toast.title }}</div>
            }
            <div>{{ toast.message }}</div>
          </div>
          <button style="background: none; border: none; color: white; cursor: pointer; padding: 2px;" (click)="notificationService.dismiss(toast.id); $event.stopPropagation()">
            <i class="ri-close-line" style="font-size: 1.1rem;"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
