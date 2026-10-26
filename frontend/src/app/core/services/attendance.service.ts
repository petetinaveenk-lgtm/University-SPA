import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Attendance, AttendanceSummary } from '../models/university.models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attendance`;

  getAll(filters?: { studentId?: string; course?: string; date?: string; status?: string }): Observable<ApiResponse<Attendance[]>> {
    let params = new HttpParams();
    if (filters?.studentId) params = params.set('studentId', filters.studentId);
    if (filters?.course) params = params.set('course', filters.course);
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<ApiResponse<Attendance[]>>(this.apiUrl, { params });
  }

  getSummary(course?: string): Observable<ApiResponse<AttendanceSummary[]>> {
    let params = new HttpParams();
    if (course) params = params.set('course', course);

    return this.http.get<ApiResponse<AttendanceSummary[]>>(`${this.apiUrl}/summary`, { params });
  }

  create(record: Omit<Attendance, 'id'>): Observable<ApiResponse<Attendance>> {
    return this.http.post<ApiResponse<Attendance>>(this.apiUrl, record);
  }

  createBulk(payload: { course: string; date: string; records: any[] }): Observable<ApiResponse<Attendance[]>> {
    return this.http.post<ApiResponse<Attendance[]>>(`${this.apiUrl}/bulk`, payload);
  }

  update(id: string, updateData: { status?: 'Present' | 'Absent'; remarks?: string }): Observable<ApiResponse<Attendance>> {
    return this.http.put<ApiResponse<Attendance>>(`${this.apiUrl}/${id}`, updateData);
  }

  delete(id: string): Observable<ApiResponse<Attendance>> {
    return this.http.delete<ApiResponse<Attendance>>(`${this.apiUrl}/${id}`);
  }
}
