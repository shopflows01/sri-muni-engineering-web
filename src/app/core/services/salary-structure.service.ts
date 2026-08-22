import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SalaryStructure } from '../../shared/models/employee.models';

export interface SalaryStructureItemRequest {
  salaryComponentId: string;
  amount: number;
}

export interface CreateSalaryStructureRequest {
  employeeId: string;
  effectiveFrom: string;
  items: SalaryStructureItemRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class SalaryStructureService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/salary-structure`;

  create(request: CreateSalaryStructureRequest): Observable<SalaryStructure> {
    return this.http.post<SalaryStructure>(this.apiUrl, request);
  }

  getCurrent(employeeId: string): Observable<SalaryStructure> {
    return this.http.get<SalaryStructure>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getHistory(employeeId: string): Observable<SalaryStructure[]> {
    return this.http.get<SalaryStructure[]>(`${this.apiUrl}/employee/${employeeId}/history`);
  }
}
