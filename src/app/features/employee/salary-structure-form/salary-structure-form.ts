import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee.service';
import { SalaryComponentService } from '../../../core/services/salary-component.service';
import { SalaryStructureService } from '../../../core/services/salary-structure.service';
import { Employee, SalaryComponent, SalaryStructure } from '../../../shared/models/employee.models';

@Component({
  selector: 'app-salary-structure-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    @if (employee()) {
      <div class="space-y-6 max-w-4xl mx-auto">
        <div class="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div class="flex items-center gap-4">
            <button type="button" (click)="location.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <span class="material-symbols-outlined text-gray-600">arrow_back</span>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-brand">Salary Structure</h1>
              <p class="text-gray-500 text-sm mt-1">{{ employee()!.employeeCode }} &middot; {{ employee()!.fullName }}</p>
            </div>
          </div>
          <a routerLink="/employees/salary-components" class="text-brand text-sm font-medium hover:underline whitespace-nowrap">Manage Components</a>
        </div>

        @if (apiError()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ apiError() }}</div>
        }

        @if (current()) {
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-600">
            Current structure effective from <span class="font-medium">{{ current()!.effectiveFrom | date:'mediumDate' }}</span>
            &middot; Monthly Gross <span class="font-medium">{{ current()!.monthlyGross | number:'1.2-2' }}</span>
          </div>
        }

        <form [formGroup]="dummyForm" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">New Structure Effective From <span class="text-red-500">*</span></label>
              <input type="date" [formControl]="effectiveFromControl"
                class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Components</h3>
              <button type="button" (click)="addItem()"
                class="text-brand hover:text-brand-light font-medium text-sm flex items-center gap-1 bg-brand/5 px-3 py-1.5 rounded-lg transition-colors">
                <span class="material-symbols-outlined text-sm">add</span>
                Add Component
              </button>
            </div>

            <div formArrayName="items" class="space-y-3">
              @for (item of items.controls; track i; let i = $index) {
                <div [formGroupName]="i" class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="flex-1 space-y-2">
                    <label class="text-xs font-medium text-gray-600">Component</label>
                    <select formControlName="salaryComponentId"
                      class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
                      <option value="">Select Component</option>
                      @for (c of activeComponents(); track c.id) {
                        <option [value]="c.id">{{ c.name }} ({{ c.componentType === 1 ? 'Earning' : 'Deduction' }})</option>
                      }
                    </select>
                  </div>
                  <div class="w-40 space-y-2">
                    <label class="text-xs font-medium text-gray-600">Amount</label>
                    <input type="number" step="0.01" formControlName="amount"
                      class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
                  </div>
                  <button type="button" (click)="removeItem(i)" [disabled]="items.length === 1"
                    class="mt-7 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50">
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button type="button" (click)="location.back()" class="px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="button" (click)="onSubmit()" [disabled]="isSaving()"
              class="px-6 py-2 bg-brand hover:bg-brand-light text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50">
              {{ isSaving() ? 'Saving...' : 'Save New Structure' }}
            </button>
          </div>
        </form>
      </div>
    }
  `
})
export class SalaryStructureForm implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private salaryComponentService = inject(SalaryComponentService);
  private salaryStructureService = inject(SalaryStructureService);
  private route = inject(ActivatedRoute);
  public location = inject(Location);

  employee = signal<Employee | null>(null);
  components = signal<SalaryComponent[]>([]);
  activeComponents = signal<SalaryComponent[]>([]);
  current = signal<SalaryStructure | null>(null);
  isSaving = signal(false);
  apiError = signal<string | null>(null);
  employeeId!: string;

  dummyForm = this.fb.group({
    items: this.fb.array([this.createItemGroup()])
  });

  effectiveFromControl = this.fb.control(new Date().toISOString().substring(0, 10), Validators.required);

  get items() {
    return this.dummyForm.get('items') as FormArray;
  }

  createItemGroup() {
    return this.fb.group({
      salaryComponentId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem() {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number) {
    if (this.items.length > 1) this.items.removeAt(index);
  }

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('employeeId')!;

    forkJoin({
      employee: this.employeeService.getEmployee(this.employeeId),
      components: this.salaryComponentService.getAll(true)
    }).subscribe(res => {
      this.employee.set(res.employee);
      this.activeComponents.set(res.components);
    });

    this.salaryStructureService.getCurrent(this.employeeId).subscribe({
      next: (structure) => {
        this.current.set(structure);
        this.items.clear();
        structure.items.forEach(item => {
          const group = this.createItemGroup();
          group.patchValue({ salaryComponentId: item.salaryComponentId, amount: item.amount });
          this.items.push(group);
        });
      },
      error: () => this.current.set(null)
    });
  }

  onSubmit() {
    if (this.dummyForm.invalid || !this.effectiveFromControl.value) {
      this.dummyForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.apiError.set(null);

    this.salaryStructureService.create({
      employeeId: this.employeeId,
      effectiveFrom: this.effectiveFromControl.value,
      items: this.items.value
    }).subscribe({
      next: (structure) => {
        this.isSaving.set(false);
        this.current.set(structure);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.apiError.set(err.error?.message || 'Failed to save salary structure.');
      }
    });
  }
}
