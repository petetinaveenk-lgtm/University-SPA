import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private counter = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string, durationMs = 4000): void {
    const id = ++this.counter;
    const toast: ToastMessage = { id, type, message, title };

    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  success(message: string, title = 'Success'): void {
    this.show('success', message, title);
  }

  error(message: string, title = 'Error'): void {
    this.show('error', message, title, 5000);
  }

  info(message: string, title = 'Info'): void {
    this.show('info', message, title);
  }

  warning(message: string, title = 'Warning'): void {
    this.show('warning', message, title);
  }

  dismiss(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
