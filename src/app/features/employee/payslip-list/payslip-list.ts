import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { PayslipService } from '../../../core/services/payslip.service';
import { Employee, MONTH_OPTIONS, PayoutStatus, PayslipListItem, monthName } from '../../../shared/models/employee.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-payslip-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyState],
  template: `
    <div class="space-y-6">
      <div class="pb-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-brand">Payslips</h1>
        <p class="text-gray-500 text-sm mt-1">Download employee payslips for a processed payroll run</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <select [(ngModel)]="employeeId" (ngModelChange)="load()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
          <option value="">All Employees</option>
          @for (emp of employees(); track emp.id) { <option [value]="emp.id">{{ emp.employeeCode }} - {{ emp.fullName }}</option> }
        </select>
        <select [(ngModel)]="month" (ngModelChange)="load()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
          <option value="">All Months</option>
          @for (opt of monthOptions; track opt.value) { <option [value]="opt.value">{{ opt.label }}</option> }
        </select>
        <select [(ngModel)]="year" (ngModelChange)="load()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
          <option value="">All Years</option>
          @for (y of yearOptions; track y) { <option [value]="y">{{ y }}</option> }
        </select>
      </div>

      @if (isLoading()) {
        <div class="py-12 flex justify-center">
          <div class="w-8 h-8 border-4 border-brand-muted border-t-brand rounded-full animate-spin"></div>
        </div>
      } @else if (items().length === 0) {
        <app-empty-state title="No Payslips" message="Process a payroll run first to see payslips here."></app-empty-state>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th class="px-6 py-4 font-medium">Employee</th>
                <th class="px-6 py-4 font-medium">Period</th>
                <th class="px-6 py-4 font-medium">Net Salary</th>
                <th class="px-6 py-4 font-medium">Payout</th>
                <th class="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of items(); track item.payrollEmployeeId) {
                <tr class="hover:bg-gray-50/50">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.employeeCode }} - {{ item.employeeName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ monthLabel(item.month) }} {{ item.year }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ item.netSalary | number:'1.2-2' }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="item.payoutStatus === payoutPaid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'">
                      {{ item.payoutStatus === payoutPaid ? 'Paid' : 'Pending' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button (click)="download(item)" [disabled]="downloadingId() === item.payrollEmployeeId"
                      class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs rounded-md border border-red-200 disabled:opacity-50">
                      {{ downloadingId() === item.payrollEmployeeId ? '...' : 'Download PDF' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class PayslipList implements OnInit {
  private employeeService = inject(EmployeeService);
  private payslipService = inject(PayslipService);

  employees = signal<Employee[]>([]);
  items = signal<PayslipListItem[]>([]);
  isLoading = signal(true);
  downloadingId = signal<string | null>(null);

  employeeId = '';
  month = '';
  year = '';
  monthOptions = MONTH_OPTIONS;
  monthLabel = monthName;
  payoutPaid = PayoutStatus.Paid;

  yearOptions: number[] = (() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  })();

  ngOnInit() {
    this.employeeService.getEmployees({ pageSize: 1000 }).subscribe(res => this.employees.set(res.items));
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.payslipService.getList({
      employeeId: this.employeeId || undefined,
      month: this.month ? Number(this.month) : undefined,
      year: this.year ? Number(this.year) : undefined
    }).subscribe({
      next: (res) => {
        this.items.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  download(item: PayslipListItem) {
    this.downloadingId.set(item.payrollEmployeeId);
    this.payslipService.downloadPdf(item.payrollEmployeeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.downloadingId.set(null);
      },
      error: () => {
        this.downloadingId.set(null);
        alert('Failed to download payslip.');
      }
    });
  }
}
