import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from '../../shared/models/api.models';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './customer';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/product`;

  getProducts(search?: string, page = 1, pageSize = 10): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);
      
    if (search) params = params.set('Search', search);
    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  getProductAnalysis(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/analysis`);
  }

  exportAnalysisReport(id: string, fromDate?: string, toDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    
    return this.http.get(`${this.apiUrl}/${id}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
