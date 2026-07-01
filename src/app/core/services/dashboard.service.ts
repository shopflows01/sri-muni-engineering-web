import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
  todayInwardQty: number;
  todayOutwardQty: number;
  todayRejectedQty: number;
  monthlyInwardQty: number;
  monthlyOutwardQty: number;
  monthlyRejectedQty: number;
  pendingInvoicesCount: number;
  inProgressLedgerCount: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyRevenueTotal: number;
  dailyInwardChart: { date: string; quantity: number }[];
  dailyOutwardChart: { date: string; quantity: number }[];
  dailyRejectionChart: { date: string; quantity: number }[];
  monthlyRevenueChart: { month: string; revenue: number }[];
  ledgerStatusBreakdown: { status: string; count: number }[];
  topCustomersByVolume: { customerId: string; customerName: string; totalInwardQty: number; totalInvoices: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`);
  }
}
