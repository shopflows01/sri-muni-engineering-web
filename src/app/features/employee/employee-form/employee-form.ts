import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DesignationService } from '../../../core/services/designation.service';
import {
  Department, Designation, EMPLOYMENT_STATUS_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, GENDER_OPTIONS
} from '../../../shared/models/employee.models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button type="button" (click)="location.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-brand">{{ isEditMode() ? 'Edit Employee' : 'New Employee Register' }}</h1>
          <p class="text-gray-500 text-sm mt-1">{{ isEditMode() ? 'Update employee master details' : 'Register a new employee' }}</p>
        </div>
      </div>

      @if (apiError()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ apiError() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">

        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Personal Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">First Name <span class="text-red-500">*</span></label>
            <input type="text" formControlName="firstName" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" formControlName="lastName" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Gender <span class="text-red-500">*</span></label>
            <select formControlName="gender" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
              @for (opt of genderOptions; track opt.value) { <option [ngValue]="opt.value">{{ opt.label }}</option> }
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" formControlName="dateOfBirth" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Mobile No <span class="text-red-500">*</span></label>
            <input type="text" formControlName="mobileNo" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <input type="email" formControlName="email" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2 md:col-span-3">
            <label class="text-sm font-medium text-gray-700">Address</label>
            <input type="text" formControlName="address" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">City</label>
            <input type="text" formControlName="city" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">State</label>
            <input type="text" formControlName="state" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Pincode</label>
            <input type="text" formControlName="pincode" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
        </div>

        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide pt-2 border-t border-gray-100">Employment Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Department <span class="text-red-500">*</span></label>
            <select formControlName="departmentId" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
              <option value="">Select Department</option>
              @for (dept of departments(); track dept.id) { <option [value]="dept.id">{{ dept.name }}</option> }
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Designation <span class="text-red-500">*</span></label>
            <select formControlName="designationId" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
              <option value="">Select Designation</option>
              @for (desg of designations(); track desg.id) { <option [value]="desg.id">{{ desg.name }}</option> }
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Employment Type <span class="text-red-500">*</span></label>
            <select formControlName="employmentType" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
              @for (opt of employmentTypeOptions; track opt.value) { <option [ngValue]="opt.value">{{ opt.label }}</option> }
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Date of Joining <span class="text-red-500">*</span></label>
            <input type="date" formControlName="dateOfJoining" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          @if (isEditMode()) {
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Employment Status</label>
              <select formControlName="employmentStatus" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
                @for (opt of employmentStatusOptions; track opt.value) { <option [ngValue]="opt.value">{{ opt.label }}</option> }
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Date of Leaving</label>
              <input type="date" formControlName="dateOfLeaving" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
            </div>
          }
        </div>

        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide pt-2 border-t border-gray-100">Bank &amp; Statutory Details (Optional)</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Bank Account No</label>
            <input type="text" formControlName="bankAccountNo" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Bank Name</label>
            <input type="text" formControlName="bankName" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">IFSC Code</label>
            <input type="text" formControlName="ifscCode" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">PAN</label>
            <input type="text" formControlName="pan" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Aadhaar No</label>
            <input type="text" formControlName="aadhaarNo" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">UAN</label>
            <input type="text" formControlName="uan" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">ESIC No</label>
            <input type="text" formControlName="esicNo" class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" (click)="location.back()" class="px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button type="submit" [disabled]="form.invalid || isSaving()"
            class="px-6 py-2 bg-brand hover:bg-brand-light text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
            @if (isSaving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            } @else {
              {{ isEditMode() ? 'Update' : 'Save' }}
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class EmployeeForm implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private designationService = inject(DesignationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public location = inject(Location);

  isEditMode = signal(false);
  isSaving = signal(false);
  apiError = signal<string | null>(null);
  employeeId: string | null = null;

  departments = signal<Department[]>([]);
  designations = signal<Designation[]>([]);
  genderOptions = GENDER_OPTIONS;
  employmentTypeOptions = EMPLOYMENT_TYPE_OPTIONS;
  employmentStatusOptions = EMPLOYMENT_STATUS_OPTIONS;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    gender: [1, Validators.required],
    dateOfBirth: [''],
    mobileNo: ['', Validators.required],
    email: [''],
    address: [''],
    city: [''],
    state: [''],
    pincode: [''],
    departmentId: ['', Validators.required],
    designationId: ['', Validators.required],
    employmentType: [1, Validators.required],
    employmentStatus: [1],
    dateOfJoining: [new Date().toISOString().substring(0, 10), Validators.required],
    dateOfLeaving: [''],
    bankAccountNo: [''],
    bankName: [''],
    ifscCode: [''],
    pan: [''],
    aadhaarNo: [''],
    uan: [''],
    esicNo: ['']
  });

  ngOnInit() {
    forkJoin({
      departments: this.departmentService.getAll(true),
      designations: this.designationService.getAll(true)
    }).subscribe(res => {
      this.departments.set(res.departments);
      this.designations.set(res.designations);
    });

    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.isEditMode.set(true);
      this.employeeService.getEmployee(this.employeeId).subscribe(emp => {
        this.form.patchValue({
          ...emp,
          dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.substring(0, 10) : '',
          dateOfJoining: emp.dateOfJoining.substring(0, 10),
          dateOfLeaving: emp.dateOfLeaving ? emp.dateOfLeaving.substring(0, 10) : ''
        } as any);
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const data: any = { ...this.form.getRawValue() };
    if (!data.dateOfLeaving) data.dateOfLeaving = null;
    if (!data.dateOfBirth) data.dateOfBirth = null;

    const req = this.isEditMode() && this.employeeId
      ? this.employeeService.updateEmployee(this.employeeId, data)
      : this.employeeService.createEmployee(data);

    req.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/employees/list']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.apiError.set(err.error?.message || 'An error occurred while saving the employee.');
      }
    });
  }
}
