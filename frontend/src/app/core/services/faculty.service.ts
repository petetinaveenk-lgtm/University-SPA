import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Faculty } from '../models/university.models';

@Injectable({
  providedIn: 'root'
})
export class FacultyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/faculty`;

  getAll(filters?: { search?: string; department?: string }): Observable<ApiResponse<Faculty[]>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.department) params = params.set('department', filters.department);

    return this.http.get<ApiResponse<Faculty[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Faculty>> {
    return this.http.get<ApiResponse<Faculty>>(`${this.apiUrl}/${id}`);
  }

  create(faculty: Omit<Faculty, 'id'>): Observable<ApiResponse<Faculty>> {
    return this.http.post<ApiResponse<Faculty>>(this.apiUrl, faculty);
  }

  update(id: string, faculty: Partial<Faculty>): Observable<ApiResponse<Faculty>> {
    return this.http.put<ApiResponse<Faculty>>(`${this.apiUrl}/${id}`, faculty);
  }

  delete(id: string): Observable<ApiResponse<Faculty>> {
    return this.http.delete<ApiResponse<Faculty>>(`${this.apiUrl}/${id}`);
  }
}
