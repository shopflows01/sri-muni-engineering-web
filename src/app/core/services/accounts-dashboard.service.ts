import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InvoiceSummary {
  paidInvoices: number;
  unpaidInvoices: number;
  partiallyPaidInvoices: number;
}

export interface CustomerOutstanding {
  customerId: string;
  customerName: string;
  totalInvoiced: number;
  totalPaid: number;
  outstandingAmount: number;
  advanceBalance: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsDashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts/dashboard`;

  getInvoiceSummary(): Observable<InvoiceSummary> {
    return this.http.get<InvoiceSummary>(`${this.apiUrl}/invoices-summary`);
  }

  getCustomerOutstanding(pageNumber: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<PaginatedResult<CustomerOutstanding>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
      
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PaginatedResult<CustomerOutstanding>>(`${this.apiUrl}/customer-outstanding`, { params });
  }
}
