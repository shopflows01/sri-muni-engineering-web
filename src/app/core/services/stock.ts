import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StockLedger } from '../../shared/models/api.models';
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

  getAll(filter?: StockFilterRequest): Observable<PaginatedResponse<StockLedger>> {
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
    return this.http.get<PaginatedResponse<StockLedger>>(this.apiUrl, { params });
  }

  createInward(data: { dcNo: string; dcDate: string; customerId: string; productId: string; inwardQty: number }): Observable<StockLedger> {
    return this.http.post<StockLedger>(`${this.apiUrl}/inward`, data);
  }

  updateOutward(id: string, qty: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/outward/${id}`, { outwardQty: qty });
  }

  updateRejected(id: string, qty: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/rejected/${id}`, { rejectedQty: qty });
  }

  exportExcel(fromDate: string, toDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('period', 'monthly');
    return this.http.get(`${this.apiUrl}/export-excel`, {
      params,
      responseType: 'blob',
      headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    });
  }
}
