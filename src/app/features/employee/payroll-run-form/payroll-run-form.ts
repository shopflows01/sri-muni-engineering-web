import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';
import { MONTH_OPTIONS } from '../../../shared/models/employee.models';

@Component({
  selector: 'app-payroll-run-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 max-w-lg mx-auto">
      <div class="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button type="button" (click)="location.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-brand">New Payroll Run</h1>
          <p class="text-gray-500 text-sm mt-1">Create a draft run for a month before processing it</p>
        </div>
      </div>

      @if (apiError()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ apiError() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Month <span class="text-red-500">*</span></label>
            <select formControlName="month" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
              @for (opt of monthOptions; track opt.value) { <option [ngValue]="opt.value">{{ opt.label }}</option> }
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Year <span class="text-red-500">*</span></label>
            <input type="number" formControlName="year" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Remarks</label>
          <input type="text" formControlName="remarks" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" (click)="location.back()" class="px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button type="submit" [disabled]="form.invalid || isSaving()"
            class="px-6 py-2 bg-brand hover:bg-brand-light text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50">
            {{ isSaving() ? 'Creating...' : 'Create Run' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class PayrollRunForm {
  private fb = inject(FormBuilder);
  private payrollService = inject(PayrollService);
  private router = inject(Router);
  public location = inject(Location);

  isSaving = signal(false);
  apiError = signal<string | null>(null);
  monthOptions = MONTH_OPTIONS;

  form = this.fb.group({
    month: [new Date().getMonth() + 1, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    remarks: ['']
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const { month, year, remarks } = this.form.getRawValue();

    this.payrollService.create(month!, year!, remarks || undefined).subscribe({
      next: (run) => {
        this.isSaving.set(false);
        this.router.navigate(['/employees/payroll', run.id]);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.apiError.set(err.error?.message || 'Failed to create payroll run.');
      }
    });
  }
}
