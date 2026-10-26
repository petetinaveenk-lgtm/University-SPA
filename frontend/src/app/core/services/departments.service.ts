import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Department } from '../models/university.models';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/departments`;

  getAll(search?: string): Observable<ApiResponse<Department[]>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);

    return this.http.get<ApiResponse<Department[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/${id}`);
  }

  create(department: Omit<Department, 'id'>): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(this.apiUrl, department);
  }

  update(id: string, department: Partial<Department>): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.apiUrl}/${id}`, department);
  }

  delete(id: string): Observable<ApiResponse<Department>> {
    return this.http.delete<ApiResponse<Department>>(`${this.apiUrl}/${id}`);
  }
}
