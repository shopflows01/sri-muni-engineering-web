import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendanceStatus, EmployeeAttendance } from '../../shared/models/employee.models';

export interface MarkAttendanceItem {
  employeeId: string;
  status: AttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  overtimeHours?: number | null;
  remarks?: string | null;
}

export interface BulkMarkAttendanceRequest {
  attendanceDate: string;
  items: MarkAttendanceItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attendance`;

  bulkMark(request: BulkMarkAttendanceRequest): Observable<EmployeeAttendance[]> {
    return this.http.post<EmployeeAttendance[]>(`${this.apiUrl}/bulk`, request);
  }

  getAll(filter: { employeeId?: string; fromDate?: string; toDate?: string } = {}): Observable<EmployeeAttendance[]> {
    let params = new HttpParams();
    if (filter.employeeId) params = params.set('EmployeeId', filter.employeeId);
    if (filter.fromDate) params = params.set('FromDate', filter.fromDate);
    if (filter.toDate) params = params.set('ToDate', filter.toDate);
    return this.http.get<EmployeeAttendance[]>(this.apiUrl, { params });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
