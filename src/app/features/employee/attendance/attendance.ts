import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import {
  ATTENDANCE_STATUS_OPTIONS, AttendanceStatus, Employee, EmployeeAttendance, optionLabel
} from '../../../shared/models/employee.models';

interface AttendanceRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  status: AttendanceStatus;
  checkInTime: string;
  checkOutTime: string;
  remarks: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 class="text-2xl font-bold text-brand">Attendance</h1>
          <p class="text-gray-500 text-sm mt-1">Mark daily in/out attendance or review history</p>
        </div>
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button (click)="mode.set('entry')" [class]="mode() === 'entry' ? 'bg-white shadow-sm text-brand' : 'text-gray-500'"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors">Daily Entry</button>
          <button (click)="showHistory()" [class]="mode() === 'history' ? 'bg-white shadow-sm text-brand' : 'text-gray-500'"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors">History</button>
        </div>
      </div>

      @if (mode() === 'entry') {
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-700">Date</label>
          <input type="date" [(ngModel)]="entryDate" (ngModelChange)="loadEntryGrid()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
        </div>

        @if (isLoading()) {
          <div class="py-12 flex justify-center">
            <div class="w-8 h-8 border-4 border-brand-muted border-t-brand rounded-full animate-spin"></div>
          </div>
        } @else {
          @if (saveMessage()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{{ saveMessage() }}</div>
          }
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th class="px-4 py-3 font-medium">Code</th>
                  <th class="px-4 py-3 font-medium">Name</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3 font-medium">In</th>
                  <th class="px-4 py-3 font-medium">Out</th>
                  <th class="px-4 py-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (row of rows(); track row.employeeId) {
                  <tr>
                    <td class="px-4 py-2 font-medium text-brand text-sm">{{ row.employeeCode }}</td>
                    <td class="px-4 py-2 text-sm">{{ row.employeeName }}</td>
                    <td class="px-4 py-2">
                      <select [(ngModel)]="row.status" class="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand outline-none">
                        @for (opt of statusOptions; track opt.value) { <option [ngValue]="opt.value">{{ opt.label }}</option> }
                      </select>
                    </td>
                    <td class="px-4 py-2"><input type="time" [(ngModel)]="row.checkInTime" class="px-2 py-1.5 border border-gray-300 rounded-lg text-sm w-28"></td>
                    <td class="px-4 py-2"><input type="time" [(ngModel)]="row.checkOutTime" class="px-2 py-1.5 border border-gray-300 rounded-lg text-sm w-28"></td>
                    <td class="px-4 py-2"><input type="text" [(ngModel)]="row.remarks" class="px-2 py-1.5 border border-gray-300 rounded-lg text-sm w-full"></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="flex justify-end">
            <button (click)="saveAll()" [disabled]="isSaving()"
              class="px-6 py-2 bg-brand hover:bg-brand-light text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50">
              {{ isSaving() ? 'Saving...' : 'Save All' }}
            </button>
          </div>
        }
      } @else {
        <div class="flex flex-col sm:flex-row gap-3">
          <select [(ngModel)]="historyEmployeeId" (ngModelChange)="loadHistory()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
            <option value="">All Employees</option>
            @for (emp of employees(); track emp.id) { <option [value]="emp.id">{{ emp.employeeCode }} - {{ emp.fullName }}</option> }
          </select>
          <input type="date" [(ngModel)]="historyFrom" (ngModelChange)="loadHistory()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
          <input type="date" [(ngModel)]="historyTo" (ngModelChange)="loadHistory()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th class="px-6 py-3 font-medium">Date</th>
                <th class="px-6 py-3 font-medium">Employee</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium">In</th>
                <th class="px-6 py-3 font-medium">Out</th>
                <th class="px-6 py-3 font-medium">Hours</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (a of history(); track a.id) {
                <tr>
                  <td class="px-6 py-3 text-sm">{{ a.attendanceDate | date:'mediumDate' }}</td>
                  <td class="px-6 py-3 text-sm">{{ a.employeeCode }} - {{ a.employeeName }}</td>
                  <td class="px-6 py-3 text-sm">{{ statusLabel(a.status) }}</td>
                  <td class="px-6 py-3 text-sm">{{ a.checkInTime || '-' }}</td>
                  <td class="px-6 py-3 text-sm">{{ a.checkOutTime || '-' }}</td>
                  <td class="px-6 py-3 text-sm">{{ a.workingHours ?? '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class Attendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);

  mode = signal<'entry' | 'history'>('entry');
  isLoading = signal(false);
  isSaving = signal(false);
  saveMessage = signal<string | null>(null);

  employees = signal<Employee[]>([]);
  rows = signal<AttendanceRow[]>([]);
  history = signal<EmployeeAttendance[]>([]);

  entryDate = new Date().toISOString().substring(0, 10);
  historyEmployeeId = '';
  historyFrom = new Date(new Date().setDate(1)).toISOString().substring(0, 10);
  historyTo = new Date().toISOString().substring(0, 10);

  statusOptions = ATTENDANCE_STATUS_OPTIONS;
  statusLabel = (v: number) => optionLabel(this.statusOptions, v);

  ngOnInit() {
    this.employeeService.getEmployees({ employmentStatus: 1, pageSize: 1000 }).subscribe(res => {
      this.employees.set(res.items);
      this.loadEntryGrid();
    });
  }

  loadEntryGrid() {
    this.isLoading.set(true);
    this.saveMessage.set(null);
    this.attendanceService.getAll({ fromDate: this.entryDate, toDate: this.entryDate }).subscribe(existing => {
      const byEmployee = new Map(existing.map(a => [a.employeeId, a]));
      this.rows.set(this.employees().map(emp => {
        const record = byEmployee.get(emp.id);
        return {
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          status: record?.status ?? AttendanceStatus.Present,
          checkInTime: record?.checkInTime ?? '',
          checkOutTime: record?.checkOutTime ?? '',
          remarks: record?.remarks ?? ''
        };
      }));
      this.isLoading.set(false);
    });
  }

  saveAll() {
    this.isSaving.set(true);
    this.saveMessage.set(null);
    this.attendanceService.bulkMark({
      attendanceDate: this.entryDate,
      items: this.rows().map(r => ({
        employeeId: r.employeeId,
        status: r.status,
        checkInTime: r.checkInTime || null,
        checkOutTime: r.checkOutTime || null,
        remarks: r.remarks || null
      }))
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveMessage.set(`Attendance saved for ${this.rows().length} employee(s) on ${this.entryDate}.`);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveMessage.set(null);
        alert('Failed to save attendance.');
      }
    });
  }

  showHistory() {
    this.mode.set('history');
    this.loadHistory();
  }

  loadHistory() {
    this.attendanceService.getAll({
      employeeId: this.historyEmployeeId || undefined,
      fromDate: this.historyFrom,
      toDate: this.historyTo
    }).subscribe(records => this.history.set(records));
  }
}
