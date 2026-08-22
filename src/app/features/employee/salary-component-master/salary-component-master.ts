import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalaryComponentService } from '../../../core/services/salary-component.service';
import {
  SalaryComponent, SALARY_CALCULATION_TYPE_OPTIONS, SALARY_COMPONENT_TYPE_OPTIONS, optionLabel
} from '../../../shared/models/employee.models';

@Component({
  selector: 'app-salary-component-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button type="button" (click)="location.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-brand">Salary Components</h1>
          <p class="text-gray-500 text-sm mt-1">Earnings and deductions available when building an employee's salary structure</p>
        </div>
      </div>

      @if (apiError()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ apiError() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Code <span class="text-red-500">*</span></label>
          <input type="text" formControlName="code" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
          <input type="text" formControlName="name" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Type</label>
          <select formControlName="componentType" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
            @for (opt of componentTypeOptions; track opt.value) { <option [ngValue]="opt.value">{{ opt.label }}</option> }
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Calculation</label>
          <select formControlName="calculationType" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
            @for (opt of calculationTypeOptions; track opt.value) { <option [ngValue]="opt.value">{{ opt.label }}</option> }
          </select>
        </div>
        <div class="flex gap-2">
          <button type="submit" [disabled]="form.invalid"
            class="flex-1 px-4 py-2 bg-brand hover:bg-brand-light text-white font-medium rounded-lg transition-colors disabled:opacity-50">
            {{ editingId() ? 'Update' : 'Add' }}
          </button>
          @if (editingId()) {
            <button type="button" (click)="resetForm()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          }
        </div>
        @if (editingId()) {
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" formControlName="isActive" class="rounded border-gray-300 text-brand focus:ring-brand">
            Active
          </label>
        }
      </form>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
              <th class="px-6 py-3 font-medium">Code</th>
              <th class="px-6 py-3 font-medium">Name</th>
              <th class="px-6 py-3 font-medium">Type</th>
              <th class="px-6 py-3 font-medium">Calculation</th>
              <th class="px-6 py-3 font-medium">Active</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (c of components(); track c.id) {
              <tr class="hover:bg-gray-50/50">
                <td class="px-6 py-3 font-medium text-brand">{{ c.code }}</td>
                <td class="px-6 py-3 text-sm">{{ c.name }}</td>
                <td class="px-6 py-3 text-sm">{{ typeLabel(c.componentType) }}</td>
                <td class="px-6 py-3 text-sm">{{ calcLabel(c.calculationType) }}</td>
                <td class="px-6 py-3 text-sm">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ c.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button (click)="edit(c)" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-md border border-blue-200">Edit</button>
                    <button (click)="remove(c)" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs rounded-md border border-red-200">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SalaryComponentMaster implements OnInit {
  private fb = inject(FormBuilder);
  private salaryComponentService = inject(SalaryComponentService);
  public location = inject(Location);

  components = signal<SalaryComponent[]>([]);
  editingId = signal<string | null>(null);
  apiError = signal<string | null>(null);
  componentTypeOptions = SALARY_COMPONENT_TYPE_OPTIONS;
  calculationTypeOptions = SALARY_CALCULATION_TYPE_OPTIONS;

  typeLabel = (v: number) => optionLabel(this.componentTypeOptions, v);
  calcLabel = (v: number) => optionLabel(this.calculationTypeOptions, v);

  form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    componentType: [1, Validators.required],
    calculationType: [2, Validators.required],
    displayOrder: [0],
    isActive: [true]
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.salaryComponentService.getAll().subscribe(res => this.components.set(res));
  }

  edit(c: SalaryComponent) {
    this.editingId.set(c.id);
    this.form.patchValue({
      code: c.code, name: c.name, componentType: c.componentType,
      calculationType: c.calculationType, displayOrder: c.displayOrder, isActive: c.isActive
    });
  }

  resetForm() {
    this.editingId.set(null);
    this.form.reset({ code: '', name: '', componentType: 1, calculationType: 2, displayOrder: 0, isActive: true });
  }

  remove(c: SalaryComponent) {
    if (!confirm(`Delete salary component "${c.name}"?`)) return;
    this.salaryComponentService.delete(c.id).subscribe({
      next: () => this.load(),
      error: (err) => this.apiError.set(err.error?.message || 'Failed to delete salary component.')
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.apiError.set(null);
    const data: any = this.form.getRawValue();

    const req = this.editingId()
      ? this.salaryComponentService.update(this.editingId()!, data)
      : this.salaryComponentService.create(data);

    req.subscribe({
      next: () => {
        this.resetForm();
        this.load();
      },
      error: (err) => this.apiError.set(err.error?.message || 'Failed to save salary component.')
    });
  }
}
