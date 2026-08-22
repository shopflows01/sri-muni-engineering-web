import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SalaryComponent } from '../../shared/models/employee.models';

@Injectable({
  providedIn: 'root'
})
export class SalaryComponentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/salary-component`;

  getAll(isActive?: boolean): Observable<SalaryComponent[]> {
    let params = new HttpParams();
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<SalaryComponent[]>(this.apiUrl, { params });
  }

  create(component: Partial<SalaryComponent>): Observable<SalaryComponent> {
    return this.http.post<SalaryComponent>(this.apiUrl, component);
  }

  update(id: string, component: Partial<SalaryComponent>): Observable<SalaryComponent> {
    return this.http.put<SalaryComponent>(`${this.apiUrl}/${id}`, component);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
