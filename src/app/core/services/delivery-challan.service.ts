import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeliveryChallan } from '../../shared/models/api.models';

export interface CreateDeliveryChallanItemRequest {
  productId: string;
  quantity: number;
  remarks?: string;
}

export interface CreateDeliveryChallanRequest {
  customerId: string;
  dcDate: string;
  yourDcNo?: string;
  yourDcDate?: string;
  poNo?: string;
  remarks?: string;
  items: CreateDeliveryChallanItemRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryChallanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/DeliveryChallans`;

  getAll(): Observable<DeliveryChallan[]> {
    return this.http.get<DeliveryChallan[]>(this.apiUrl);
  }

  getById(id: string): Observable<DeliveryChallan> {
    return this.http.get<DeliveryChallan>(`${this.apiUrl}/${id}`);
  }

  create(dc: CreateDeliveryChallanRequest): Observable<DeliveryChallan> {
    return this.http.post<DeliveryChallan>(this.apiUrl, dc);
  }

  update(id: string, dc: CreateDeliveryChallanRequest): Observable<DeliveryChallan> {
    return this.http.put<DeliveryChallan>(`${this.apiUrl}/${id}`, dc);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/generate-document`, { responseType: 'blob' });
  }
}
