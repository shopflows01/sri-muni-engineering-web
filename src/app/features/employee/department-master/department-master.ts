import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../shared/models/employee.models';

@Component({
  selector: 'app-department-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 max-w-3xl mx-auto">
      <div class="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button type="button" (click)="location.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-brand">Departments</h1>
          <p class="text-gray-500 text-sm mt-1">Manage the department list used across employee records</p>
        </div>
      </div>

      @if (apiError()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ apiError() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Code <span class="text-red-500">*</span></label>
          <input type="text" formControlName="code" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
          <input type="text" formControlName="name" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
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
        <div class="space-y-2 md:col-span-3">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <input type="text" formControlName="description" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none">
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
              <th class="px-6 py-3 font-medium">Description</th>
              <th class="px-6 py-3 font-medium">Active</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (d of departments(); track d.id) {
              <tr class="hover:bg-gray-50/50">
                <td class="px-6 py-3 font-medium text-brand">{{ d.code }}</td>
                <td class="px-6 py-3 text-sm">{{ d.name }}</td>
                <td class="px-6 py-3 text-sm text-gray-500">{{ d.description || '-' }}</td>
                <td class="px-6 py-3 text-sm">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="d.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ d.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button (click)="edit(d)" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-md border border-blue-200">Edit</button>
                    <button (click)="remove(d)" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs rounded-md border border-red-200">Delete</button>
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
export class DepartmentMaster implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  public location = inject(Location);

  departments = signal<Department[]>([]);
  editingId = signal<string | null>(null);
  apiError = signal<string | null>(null);

  form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.departmentService.getAll().subscribe(res => this.departments.set(res));
  }

  edit(d: Department) {
    this.editingId.set(d.id);
    this.form.patchValue({ code: d.code, name: d.name, description: d.description, isActive: d.isActive });
  }

  resetForm() {
    this.editingId.set(null);
    this.form.reset({ code: '', name: '', description: '', isActive: true });
  }

  remove(d: Department) {
    if (!confirm(`Delete department "${d.name}"?`)) return;
    this.departmentService.delete(d.id).subscribe({
      next: () => this.load(),
      error: (err) => this.apiError.set(err.error?.message || 'Failed to delete department.')
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.apiError.set(null);
    const data: any = this.form.getRawValue();

    const req = this.editingId()
      ? this.departmentService.update(this.editingId()!, data)
      : this.departmentService.create(data);

    req.subscribe({
      next: () => {
        this.resetForm();
        this.load();
      },
      error: (err) => this.apiError.set(err.error?.message || 'Failed to save department.')
    });
  }
}
