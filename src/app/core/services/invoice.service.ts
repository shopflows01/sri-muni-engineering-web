import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice } from '../../shared/models/api.models';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface InvoiceFilterRequest {
  search?: string;
  page?: number;
  pageSize?: number;
  customerId?: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invoice`;

  getAll(filter?: InvoiceFilterRequest): Observable<PaginatedResponse<Invoice>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.page) params = params.set('Page', filter.page.toString());
      if (filter.pageSize) params = params.set('PageSize', filter.pageSize.toString());
      if (filter.search) params = params.set('Search', filter.search);
      if (filter.customerId) params = params.set('CustomerId', filter.customerId);
    }
    return this.http.get<PaginatedResponse<Invoice>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, data);
  }

  getPdf(id: string): Observable<{ downloadUrl: string }> {
    return this.http.get<{ downloadUrl: string }>(`${this.apiUrl}/${id}/pdf`);
  }

  getNextInvoiceNumber(date?: string): Observable<{ invoiceNo: string; invoiceSequence: number; financialYear: string }> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<{ invoiceNo: string; invoiceSequence: number; financialYear: string }>(`${this.apiUrl}/next-number`, { params });
  }

  getPdfPreview(id: string, options?: { originalForRecipient?: boolean; duplicateForTransporter?: boolean; triplicateForSupplier?: boolean }): Observable<Blob> {
    let params = new HttpParams();
    if (options?.originalForRecipient) params = params.set('originalForRecipient', 'true');
    if (options?.duplicateForTransporter) params = params.set('duplicateForTransporter', 'true');
    if (options?.triplicateForSupplier) params = params.set('triplicateForSupplier', 'true');
    
    return this.http.get(`${this.apiUrl}/${id}/pdf/preview`, { params, responseType: 'blob' });
  }
}
