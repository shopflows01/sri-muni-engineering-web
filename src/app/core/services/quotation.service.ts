import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quotation } from '../../shared/models/api.models';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface QuotationFilterRequest {
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/quotation`;

  getAll(filter?: QuotationFilterRequest): Observable<PaginatedResponse<Quotation>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.page) params = params.set('Page', filter.page.toString());
      if (filter.pageSize) params = params.set('PageSize', filter.pageSize.toString());
      if (filter.search) params = params.set('Search', filter.search);
    }
    return this.http.get<PaginatedResponse<Quotation>>(this.apiUrl, { params });
  }

  create(data: Partial<Quotation>): Observable<Quotation> {
    return this.http.post<Quotation>(this.apiUrl, data);
  }

  getPdf(id: string, regenerate = false): Observable<{ downloadUrl: string }> {
    let params = new HttpParams();
    if (regenerate) params = params.set('regenerate', 'true');
    return this.http.get<{ downloadUrl: string }>(`${this.apiUrl}/${id}/pdf`, { params });
  }
}
