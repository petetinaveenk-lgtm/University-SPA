import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Timetable } from '../models/university.models';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/timetable`;

  getAll(filters?: { day?: string; department?: string; faculty?: string; search?: string }): Observable<ApiResponse<Timetable[]>> {
    let params = new HttpParams();
    if (filters?.day) params = params.set('day', filters.day);
    if (filters?.department) params = params.set('department', filters.department);
    if (filters?.faculty) params = params.set('faculty', filters.faculty);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<ApiResponse<Timetable[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Timetable>> {
    return this.http.get<ApiResponse<Timetable>>(`${this.apiUrl}/${id}`);
  }

  create(timetable: Omit<Timetable, 'id'>): Observable<ApiResponse<Timetable>> {
    return this.http.post<ApiResponse<Timetable>>(this.apiUrl, timetable);
  }

  update(id: string, timetable: Partial<Timetable>): Observable<ApiResponse<Timetable>> {
    return this.http.put<ApiResponse<Timetable>>(`${this.apiUrl}/${id}`, timetable);
  }

  delete(id: string): Observable<ApiResponse<Timetable>> {
    return this.http.delete<ApiResponse<Timetable>>(`${this.apiUrl}/${id}`);
  }
}
