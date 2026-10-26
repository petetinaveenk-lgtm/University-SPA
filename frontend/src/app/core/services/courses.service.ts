import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Course } from '../models/university.models';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/courses`;

  getAll(filters?: { search?: string; department?: string }): Observable<ApiResponse<Course[]>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.department) params = params.set('department', filters.department);

    return this.http.get<ApiResponse<Course[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Course>> {
    return this.http.get<ApiResponse<Course>>(`${this.apiUrl}/${id}`);
  }

  create(course: Omit<Course, 'id'>): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(this.apiUrl, course);
  }

  update(id: string, course: Partial<Course>): Observable<ApiResponse<Course>> {
    return this.http.put<ApiResponse<Course>>(`${this.apiUrl}/${id}`, course);
  }

  delete(id: string): Observable<ApiResponse<Course>> {
    return this.http.delete<ApiResponse<Course>>(`${this.apiUrl}/${id}`);
  }
}
