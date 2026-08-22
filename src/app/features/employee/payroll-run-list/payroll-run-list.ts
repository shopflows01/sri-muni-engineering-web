import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';
import { PayrollRun, PayrollRunStatus, monthName } from '../../../shared/models/employee.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-payroll-run-list',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyState],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 class="text-2xl font-bold text-brand">Payroll</h1>
          <p class="text-gray-500 text-sm mt-1">Monthly payroll runs</p>
        </div>
        <a routerLink="/employees/payroll/new"
          class="bg-brand hover:bg-brand-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
          + New Payroll Run
        </a>
      </div>

      @if (isLoading()) {
        <div class="py-12 flex justify-center">
          <div class="w-8 h-8 border-4 border-brand-muted border-t-brand rounded-full animate-spin"></div>
        </div>
      } @else if (runs().length === 0) {
        <app-empty-state title="No Payroll Runs" message="Create a payroll run to process salaries for a month."
          actionLabel="New Payroll Run" (action)="router.navigate(['/employees/payroll/new'])">
        </app-empty-state>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th class="px-6 py-4 font-medium">Period</th>
                <th class="px-6 py-4 font-medium">Status</th>
                <th class="px-6 py-4 font-medium">Employees</th>
                <th class="px-6 py-4 font-medium">Total Net Salary</th>
                <th class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (run of runs(); track run.id) {
                <tr class="hover:bg-gray-50/50">
                  <td class="px-6 py-4 font-medium text-gray-900">{{ monthLabel(run.month) }} {{ run.year }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="statusClass(run.status)">
                      {{ statusText(run.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ run.employeeCount }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ run.totalNetSalary | number:'1.2-2' }}</td>
                  <td class="px-6 py-4 text-right">
                    <a [routerLink]="['/employees/payroll', run.id]"
                      class="flex items-center gap-1.5 justify-end px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs rounded-md transition-colors border border-gray-200 shadow-sm inline-flex">
                      <span class="material-symbols-outlined text-[16px]">visibility</span>
                      View
                    </a>
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
export class PayrollRunList implements OnInit {
  private payrollService = inject(PayrollService);
  router = inject(Router);

  runs = signal<PayrollRun[]>([]);
  isLoading = signal(true);
  monthLabel = monthName;

  statusText(status: PayrollRunStatus) {
    return status === PayrollRunStatus.Draft ? 'Draft' : status === PayrollRunStatus.Processed ? 'Processed' : 'Paid';
  }

  statusClass(status: PayrollRunStatus) {
    if (status === PayrollRunStatus.Paid) return 'bg-green-50 text-green-700';
    if (status === PayrollRunStatus.Processed) return 'bg-blue-50 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  }

  ngOnInit() {
    this.payrollService.getAll().subscribe({
      next: (res) => {
        this.runs.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
