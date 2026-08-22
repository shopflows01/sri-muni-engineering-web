import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Designation } from '../../shared/models/employee.models';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/designation`;

  getAll(isActive?: boolean): Observable<Designation[]> {
    let params = new HttpParams();
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<Designation[]>(this.apiUrl, { params });
  }

  create(designation: Partial<Designation>): Observable<Designation> {
    return this.http.post<Designation>(this.apiUrl, designation);
  }

  update(id: string, designation: Partial<Designation>): Observable<Designation> {
    return this.http.put<Designation>(`${this.apiUrl}/${id}`, designation);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
