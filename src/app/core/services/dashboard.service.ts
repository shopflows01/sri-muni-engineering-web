import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  monthlyRevenue: number;
  monthlyInvoices: number;
  monthlyInwardQty: number;
  monthlyOutwardQty: number;
  monthlyRejectedQty: number;
  revenueTrend: { date: string; amount: number }[];
  topCustomers: { customerName: string; revenue: number; invoiceCount: number }[];
  inProgressLedgers: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getSummary(month?: number, year?: number): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (month) params = params.set('Month', month.toString());
    if (year) params = params.set('Year', year.toString());
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`, { params });
  }
}
