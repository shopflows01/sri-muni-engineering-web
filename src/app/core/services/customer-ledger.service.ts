import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LedgerEntry {
  date: string;
  voucherNumber: string;
  voucherType: string;
  narration: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateLedgerRequest {
  customerId: string;
  balanceType: 'Debit' | 'Credit';
  openingBalance: number;
}

export interface CustomerLedgerResponse {
  customerId: string;
  ledgerNo: string;
  customerName: string;
  openingBalance: number;
  openingBalanceType: string;
  currentBalance: number;
  outstandingAmount: number;
  advanceAmount: number;
  entries: {
    items: LedgerEntry[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CustomerLedgerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts/customers`;

  getLedger(customerId: string, pageNumber: number = 1, pageSize: number = 20): Observable<CustomerLedgerResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
      
    return this.http.get<CustomerLedgerResponse>(`${this.apiUrl}/${customerId}/ledger`, { params });
  }

  getOutstanding(customerId: string): Observable<{ customerId: string; outstanding: number }> {
    return this.http.get<{ customerId: string; outstanding: number }>(`${this.apiUrl}/${customerId}/outstanding`);
  }

  getAdvanceBalance(customerId: string): Observable<{ customerId: string; advanceBalance: number }> {
    return this.http.get<{ customerId: string; advanceBalance: number }>(`${this.apiUrl}/${customerId}/advance`);
  }

  createLedger(request: CreateLedgerRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/ledger`, request);
  }

  exportLedgerToExcel(customerId: string, fromDate?: string, toDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    
    return this.http.get(`${this.apiUrl}/${customerId}/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportTransactionStatementToExcel(customerId: string, fromDate?: string, toDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    
    return this.http.get(`${this.apiUrl}/${customerId}/transaction-statement`, {
      params,
      responseType: 'blob'
    });
  }
}
