import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StockLedger } from '../../shared/models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stock`;

  createInward(data: Partial<StockLedger>): Observable<StockLedger> {
    return this.http.post<StockLedger>(`${this.apiUrl}/inward`, data);
  }

  updateOutward(id: string, qty: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/outward/${id}`, { outwardQty: qty });
  }

  updateRejected(id: string, qty: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/rejected/${id}`, { rejectedQty: qty });
  }
}
