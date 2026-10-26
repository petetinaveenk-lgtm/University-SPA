import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Student } from '../models/university.models';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/students`;

  getAll(filters?: { search?: string; department?: string; year?: string }): Observable<ApiResponse<Student[]>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.department) params = params.set('department', filters.department);
    if (filters?.year) params = params.set('year', filters.year);

    return this.http.get<ApiResponse<Student[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.apiUrl}/${id}`);
  }

  create(student: Omit<Student, 'id'>): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(this.apiUrl, student);
  }

  update(id: string, student: Partial<Student>): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.apiUrl}/${id}`, student);
  }

  delete(id: string): Observable<ApiResponse<Student>> {
    return this.http.delete<ApiResponse<Student>>(`${this.apiUrl}/${id}`);
  }
}
