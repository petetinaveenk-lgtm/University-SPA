import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DashboardStats } from '../models/university.models';

export interface HealthStatus {
  status: string;
  message?: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`);
  }

  checkHealth(): Observable<HealthStatus | null> {
    return this.http.get<HealthStatus>(`${environment.apiUrl}/health`).pipe(
      catchError(() => of(null))
    );
  }
}
