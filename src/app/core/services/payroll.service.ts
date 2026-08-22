import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayrollRun, ProcessPayrollResponse } from '../../shared/models/employee.models';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payroll-run`;

  getAll(year?: number): Observable<PayrollRun[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<PayrollRun[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<PayrollRun> {
    return this.http.get<PayrollRun>(`${this.apiUrl}/${id}`);
  }

  create(month: number, year: number, remarks?: string): Observable<PayrollRun> {
    return this.http.post<PayrollRun>(this.apiUrl, { month, year, remarks });
  }

  process(id: string): Observable<ProcessPayrollResponse> {
    return this.http.post<ProcessPayrollResponse>(`${this.apiUrl}/${id}/process`, {});
  }

  markPaid(id: string): Observable<PayrollRun> {
    return this.http.post<PayrollRun>(`${this.apiUrl}/${id}/mark-paid`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
