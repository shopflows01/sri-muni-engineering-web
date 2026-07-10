import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { JobWorkDC } from '../../shared/models/api.models';
import { Observable } from 'rxjs';

export interface StockFilterRequest {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: number;
  dcNo?: string;
  customerId?: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stock`;

  getAll(filter?: StockFilterRequest): Observable<PaginatedResponse<JobWorkDC>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.page) params = params.set('Page', filter.page.toString());
      if (filter.pageSize) params = params.set('PageSize', filter.pageSize.toString());
      if (filter.search) params = params.set('Search', filter.search);
      if (filter.status !== undefined) params = params.set('Status', filter.status.toString());
      if (filter.dcNo) params = params.set('DcNo', filter.dcNo);
      if (filter.customerId) params = params.set('CustomerId', filter.customerId);
      if (filter.productId) params = params.set('ProductId', filter.productId);
    }
    return this.http.get<PaginatedResponse<JobWorkDC>>(this.apiUrl, { params });
  }

  createDC(data: { dcNo: string; dcDate: string; customerId: string; remarks?: string; items: { productId: string; qtySent: number; rate?: number; gstPercent?: number; remarks?: string }[] }): Observable<JobWorkDC> {
    return this.http.post<JobWorkDC>(`${this.apiUrl}/dc`, data);
  }

  getById(id: string): Observable<JobWorkDC> {
    return this.http.get<JobWorkDC>(`${this.apiUrl}/${id}`);
  }

  updateDC(id: string, data: { dcNo: string; dcDate: string; customerId: string; remarks?: string; items: { id?: string; productId: string; qtySent: number; rate?: number; gstPercent?: number; remarks?: string }[] }): Observable<JobWorkDC> {
    return this.http.put<JobWorkDC>(`${this.apiUrl}/${id}`, data);
  }

  addTransaction(dcItemId: string, data: { transactionType: number; transactionDate: string; quantity: number; referenceNo?: string; remarks?: string }): Observable<JobWorkDC> {
    return this.http.post<JobWorkDC>(`${this.apiUrl}/dc-item/${dcItemId}/transaction`, data);
  }

  exportExcel(fromDate?: string, toDate?: string): Observable<{ downloadUrl: string }> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<{ downloadUrl: string }>(`${this.apiUrl}/export-excel`, { params });
  }

  getTransactions(filters: { page: number; pageSize: number; search?: string; customerId?: string; productId?: string; fromDate?: string; toDate?: string; transactionType?: string }): Observable<PaginatedResponse<any>> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('pageSize', filters.pageSize.toString());
      
    if (filters.search) params = params.set('search', filters.search);
    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.transactionType) params = params.set('transactionType', filters.transactionType);

    return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/transactions`, { params });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
