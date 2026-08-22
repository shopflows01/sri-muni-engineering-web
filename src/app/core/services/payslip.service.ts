import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayslipListItem } from '../../shared/models/employee.models';

@Injectable({
  providedIn: 'root'
})
export class PayslipService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payslip`;

  getList(filter: { employeeId?: string; month?: number; year?: number } = {}): Observable<PayslipListItem[]> {
    let params = new HttpParams();
    if (filter.employeeId) params = params.set('EmployeeId', filter.employeeId);
    if (filter.month) params = params.set('Month', filter.month);
    if (filter.year) params = params.set('Year', filter.year);
    return this.http.get<PayslipListItem[]>(this.apiUrl, { params });
  }

  downloadPdf(payrollEmployeeId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${payrollEmployeeId}/pdf`, { responseType: 'blob' });
  }
}
