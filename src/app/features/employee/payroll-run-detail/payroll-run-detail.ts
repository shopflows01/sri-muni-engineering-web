import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';
import { PayslipService } from '../../../core/services/payslip.service';
import { PayoutStatus, PayrollRun, PayrollRunStatus, monthName } from '../../../shared/models/employee.models';
import { EmployeeSubnav } from '../employee-subnav/employee-subnav';

@Component({
  selector: 'app-payroll-run-detail',
  standalone: true,
  imports: [CommonModule, EmployeeSubnav],
  template: `
    @if (run()) {
      <div class="space-y-6">
        <app-employee-subnav></app-employee-subnav>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
          <div class="flex items-center gap-4">
            <button type="button" (click)="location.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <span class="material-symbols-outlined text-gray-600">arrow_back</span>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-brand">{{ monthLabel(run()!.month) }} {{ run()!.year }} Payroll</h1>
              <p class="text-gray-500 text-sm mt-1">
                {{ run()!.periodStartDate | date:'mediumDate' }} - {{ run()!.periodEndDate | date:'mediumDate' }}
                &middot; {{ statusText(run()!.status) }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            @if (run()!.status !== 3) {
              <button (click)="process()" [disabled]="isProcessing()"
                class="px-4 py-2 bg-brand hover:bg-brand-light text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50">
                {{ isProcessing() ? 'Processing...' : (run()!.status === 1 ? 'Process Payroll' : 'Reprocess Payroll') }}
              </button>
            }
            @if (run()!.status === 2) {
              <button (click)="markPaid()" [disabled]="isMarkingPaid()"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50">
                {{ isMarkingPaid() ? 'Saving...' : 'Mark Paid & Lock' }}
              </button>
            }
          </div>
        </div>

        @if (warnings().length > 0) {
          <div class="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm space-y-1">
            <p class="font-medium">Warnings from last processing:</p>
            @for (w of warnings(); track w) { <p>&bull; {{ w }}</p> }
          </div>
        }

        @if (run()!.employees.length === 0) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            This run hasn't been processed yet. Click "Process Payroll" to calculate salaries from attendance and salary structures.
          </div>
        } @else {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th class="px-4 py-3 font-medium">Employee</th>
                  <th class="px-4 py-3 font-medium">Dept</th>
                  <th class="px-4 py-3 font-medium">Paid Days</th>
                  <th class="px-4 py-3 font-medium">Gross</th>
                  <th class="px-4 py-3 font-medium">Deductions</th>
                  <th class="px-4 py-3 font-medium">Net Salary</th>
                  <th class="px-4 py-3 font-medium">Payout</th>
                  <th class="px-4 py-3 font-medium text-right">Payslip</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (e of run()!.employees; track e.id) {
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ e.employeeCode }} - {{ e.employeeName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ e.departmentName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ e.paidDays }} / {{ e.workingDays }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ e.grossEarnings | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ e.totalDeductions | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ e.netSalary | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="e.payoutStatus === payoutPaid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'">
                        {{ e.payoutStatus === payoutPaid ? 'Paid' : 'Pending' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button (click)="downloadPayslip(e.id)" [disabled]="downloadingId() === e.id"
                        class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs rounded-md border border-red-200 disabled:opacity-50">
                        {{ downloadingId() === e.id ? '...' : 'Download PDF' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    }
  `
})
export class PayrollRunDetail implements OnInit {
  private payrollService = inject(PayrollService);
  private payslipService = inject(PayslipService);
  private route = inject(ActivatedRoute);
  public location = inject(Location);

  run = signal<PayrollRun | null>(null);
  warnings = signal<string[]>([]);
  isProcessing = signal(false);
  isMarkingPaid = signal(false);
  downloadingId = signal<string | null>(null);
  runId!: string;

  monthLabel = monthName;
  payoutPaid = PayoutStatus.Paid;

  statusText(status: PayrollRunStatus) {
    return status === PayrollRunStatus.Draft ? 'Draft' : status === PayrollRunStatus.Processed ? 'Processed' : 'Paid & Locked';
  }

  ngOnInit() {
    this.runId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load() {
    this.payrollService.getById(this.runId).subscribe(run => this.run.set(run));
  }

  process() {
    this.isProcessing.set(true);
    this.payrollService.process(this.runId).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.run.set(res.run);
        this.warnings.set(res.warnings);
      },
      error: (err) => {
        this.isProcessing.set(false);
        alert(err.error?.message || 'Failed to process payroll run.');
      }
    });
  }

  markPaid() {
    if (!confirm('Mark this payroll run as paid? It will be locked and can no longer be reprocessed.')) return;
    this.isMarkingPaid.set(true);
    this.payrollService.markPaid(this.runId).subscribe({
      next: (run) => {
        this.isMarkingPaid.set(false);
        this.run.set(run);
      },
      error: (err) => {
        this.isMarkingPaid.set(false);
        alert(err.error?.message || 'Failed to mark payroll run as paid.');
      }
    });
  }

  downloadPayslip(payrollEmployeeId: string) {
    this.downloadingId.set(payrollEmployeeId);
    this.payslipService.downloadPdf(payrollEmployeeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.downloadingId.set(null);
      },
      error: (err) => {
        this.downloadingId.set(null);
        alert(err.error?.message || 'Failed to download payslip.');
      }
    });
  }
}
