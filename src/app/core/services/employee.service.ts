import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee } from '../../shared/models/employee.models';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface EmployeeFilter {
  search?: string;
  departmentId?: string;
  designationId?: string;
  employmentStatus?: number;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employee`;

  getEmployees(filter: EmployeeFilter = {}): Observable<PaginatedResponse<Employee>> {
    let params = new HttpParams()
      .set('Page', filter.page ?? 1)
      .set('PageSize', filter.pageSize ?? 25);

    if (filter.search) params = params.set('Search', filter.search);
    if (filter.departmentId) params = params.set('DepartmentId', filter.departmentId);
    if (filter.designationId) params = params.set('DesignationId', filter.designationId);
    if (filter.employmentStatus) params = params.set('EmploymentStatus', filter.employmentStatus);

    return this.http.get<PaginatedResponse<Employee>>(this.apiUrl, { params });
  }

  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
