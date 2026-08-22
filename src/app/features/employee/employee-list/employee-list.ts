import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DesignationService } from '../../../core/services/designation.service';
import { Department, Designation, Employee, EMPLOYMENT_STATUS_OPTIONS, optionLabel } from '../../../shared/models/employee.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, EmptyState, PaginationComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 class="text-2xl font-bold text-brand">Employees</h1>
          <p class="text-gray-500 text-sm mt-1">Manage employee master records</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <a routerLink="/employees/departments"
            class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
            Departments
          </a>
          <a routerLink="/employees/designations"
            class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
            Designations
          </a>
          <a routerLink="/employees/new"
            class="bg-brand hover:bg-brand-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            + New Employee
          </a>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <input type="text" [formControl]="searchControl" placeholder="Search by name, code or mobile..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none transition-all text-sm">
        <select [(ngModel)]="departmentFilter" (ngModelChange)="onFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
          <option value="">All Departments</option>
          @for (dept of departments(); track dept.id) {
            <option [value]="dept.id">{{ dept.name }}</option>
          }
        </select>
        <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
          <option value="">All Statuses</option>
          @for (opt of statusOptions; track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
      </div>

      @if (isLoading()) {
        <div class="py-12 flex justify-center">
          <div class="w-8 h-8 border-4 border-brand-muted border-t-brand rounded-full animate-spin"></div>
        </div>
      } @else if (employees().length === 0) {
        <app-empty-state
          title="No Employees Found"
          message="No employees match your filters yet."
          actionLabel="New Employee"
          (action)="router.navigate(['/employees/new'])">
        </app-empty-state>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th class="px-6 py-4 font-medium">Code</th>
                <th class="px-6 py-4 font-medium">Name</th>
                <th class="px-6 py-4 font-medium">Department</th>
                <th class="px-6 py-4 font-medium">Designation</th>
                <th class="px-6 py-4 font-medium">Mobile</th>
                <th class="px-6 py-4 font-medium">Status</th>
                <th class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (emp of employees(); track emp.id) {
                <tr class="hover:bg-gray-50/50">
                  <td class="px-6 py-4 font-medium text-brand">{{ emp.employeeCode }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ emp.fullName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ emp.departmentName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ emp.designationName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ emp.mobileNo }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span class="px-2 py-1 rounded-full text-xs font-medium"
                      [class]="emp.employmentStatus === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'">
                      {{ statusLabel(emp.employmentStatus) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <a [routerLink]="['/employees', emp.id]"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs rounded-md transition-colors border border-gray-200 shadow-sm">
                        <span class="material-symbols-outlined text-[16px]">visibility</span>
                        View
                      </a>
                      <a [routerLink]="['/employees', emp.id, 'edit']"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-md transition-colors border border-blue-200 shadow-sm">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <app-pagination [page]="page()" [pageSize]="pageSize()" [totalCount]="totalCount()"
            (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)">
          </app-pagination>
        </div>
      }
    </div>
  `
})
export class EmployeeList implements OnInit {
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private designationService = inject(DesignationService);
  router = inject(Router);

  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  designations = signal<Designation[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  page = signal(1);
  pageSize = signal(25);
  searchControl = new FormControl('');
  departmentFilter = '';
  statusFilter = '';
  statusOptions = EMPLOYMENT_STATUS_OPTIONS;

  statusLabel(value: number) {
    return optionLabel(this.statusOptions, value);
  }

  ngOnInit() {
    forkJoin({
      departments: this.departmentService.getAll(true),
      designations: this.designationService.getAll(true)
    }).subscribe(res => {
      this.departments.set(res.departments);
      this.designations.set(res.designations);
    });

    this.loadEmployees();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page.set(1);
      this.loadEmployees();
    });
  }

  onFilterChange() {
    this.page.set(1);
    this.loadEmployees();
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.loadEmployees();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading.set(true);
    this.employeeService.getEmployees({
      search: this.searchControl.value || undefined,
      departmentId: this.departmentFilter || undefined,
      employmentStatus: this.statusFilter ? Number(this.statusFilter) : undefined,
      page: this.page(),
      pageSize: this.pageSize()
    }).subscribe({
      next: (res) => {
        this.employees.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
