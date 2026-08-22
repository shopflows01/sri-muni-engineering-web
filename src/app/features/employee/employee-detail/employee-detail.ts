import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { SalaryStructureService } from '../../../core/services/salary-structure.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import {
  ATTENDANCE_STATUS_OPTIONS, Employee, EmployeeAttendance, EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS, GENDER_OPTIONS, optionLabel, SalaryStructure
} from '../../../shared/models/employee.models';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (employee()) {
      <div class="space-y-6 max-w-5xl mx-auto">
        <div class="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div class="flex items-center gap-4">
            <button type="button" (click)="location.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <span class="material-symbols-outlined text-gray-600">arrow_back</span>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-brand">{{ employee()!.fullName }}</h1>
              <p class="text-gray-500 text-sm mt-1">{{ employee()!.employeeCode }} &middot; {{ employee()!.designationName }}, {{ employee()!.departmentName }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/employees', employee()!.id, 'edit']"
              class="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition-colors">Edit</a>
            <a [routerLink]="['/employees/salary-structure', employee()!.id]"
              class="px-4 py-2 bg-brand hover:bg-brand-light text-white font-medium text-sm rounded-lg transition-colors">Salary Structure</a>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Personal Details</h3>
            <div class="text-sm space-y-2">
              <div class="flex justify-between"><span class="text-gray-500">Gender</span><span class="font-medium">{{ genderLabel(employee()!.gender) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Mobile</span><span class="font-medium">{{ employee()!.mobileNo }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Email</span><span class="font-medium">{{ employee()!.email || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Address</span><span class="font-medium text-right">{{ employee()!.address || '-' }}, {{ employee()!.city }} {{ employee()!.state }} {{ employee()!.pincode }}</span></div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Employment Details</h3>
            <div class="text-sm space-y-2">
              <div class="flex justify-between"><span class="text-gray-500">Type</span><span class="font-medium">{{ typeLabel(employee()!.employmentType) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Status</span><span class="font-medium">{{ statusLabel(employee()!.employmentStatus) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Date of Joining</span><span class="font-medium">{{ employee()!.dateOfJoining | date:'mediumDate' }}</span></div>
              @if (employee()!.dateOfLeaving) {
                <div class="flex justify-between"><span class="text-gray-500">Date of Leaving</span><span class="font-medium">{{ employee()!.dateOfLeaving | date:'mediumDate' }}</span></div>
              }
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Bank &amp; Statutory</h3>
            <div class="text-sm space-y-2">
              <div class="flex justify-between"><span class="text-gray-500">Bank A/C No</span><span class="font-medium">{{ employee()!.bankAccountNo || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Bank / IFSC</span><span class="font-medium">{{ employee()!.bankName || '-' }} {{ employee()!.ifscCode || '' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">PAN</span><span class="font-medium">{{ employee()!.pan || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">UAN / ESIC</span><span class="font-medium">{{ employee()!.uan || '-' }} / {{ employee()!.esicNo || '-' }}</span></div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Current Salary Structure</h3>
            @if (salaryStructure()) {
              <div class="text-sm space-y-1">
                @for (item of salaryStructure()!.items; track item.salaryComponentId) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ item.componentName }}</span>
                    <span class="font-medium">{{ item.amount | number:'1.2-2' }}{{ item.calculationType === 3 ? '%' : '' }}</span>
                  </div>
                }
                <div class="flex justify-between pt-2 border-t border-gray-100 font-bold">
                  <span>Monthly Gross</span>
                  <span>{{ salaryStructure()!.monthlyGross | number:'1.2-2' }}</span>
                </div>
              </div>
            } @else {
              <p class="text-sm text-gray-500">No salary structure defined yet.</p>
            }
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Recent Attendance (Last 30 Days)</h3>
            <a routerLink="/employees/attendance" class="text-brand text-sm font-medium hover:underline">Go to Attendance</a>
          </div>
          @if (attendance().length === 0) {
            <p class="text-sm text-gray-500">No attendance recorded in the last 30 days.</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr class="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th class="py-2 pr-4">Date</th>
                    <th class="py-2 pr-4">Status</th>
                    <th class="py-2 pr-4">In</th>
                    <th class="py-2 pr-4">Out</th>
                    <th class="py-2 pr-4">Hours</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (a of attendance(); track a.id) {
                    <tr>
                      <td class="py-2 pr-4">{{ a.attendanceDate | date:'mediumDate' }}</td>
                      <td class="py-2 pr-4">{{ attendanceStatusLabel(a.status) }}</td>
                      <td class="py-2 pr-4">{{ a.checkInTime || '-' }}</td>
                      <td class="py-2 pr-4">{{ a.checkOutTime || '-' }}</td>
                      <td class="py-2 pr-4">{{ a.workingHours ?? '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class EmployeeDetail implements OnInit {
  private employeeService = inject(EmployeeService);
  private salaryStructureService = inject(SalaryStructureService);
  private attendanceService = inject(AttendanceService);
  private route = inject(ActivatedRoute);
  public location = inject(Location);

  employee = signal<Employee | null>(null);
  salaryStructure = signal<SalaryStructure | null>(null);
  attendance = signal<EmployeeAttendance[]>([]);

  genderLabel = (v: number) => optionLabel(GENDER_OPTIONS, v);
  typeLabel = (v: number) => optionLabel(EMPLOYMENT_TYPE_OPTIONS, v);
  statusLabel = (v: number) => optionLabel(EMPLOYMENT_STATUS_OPTIONS, v);
  attendanceStatusLabel = (v: number) => optionLabel(ATTENDANCE_STATUS_OPTIONS, v);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.employeeService.getEmployee(id).subscribe(emp => this.employee.set(emp));
    this.salaryStructureService.getCurrent(id).subscribe({
      next: (s) => this.salaryStructure.set(s),
      error: () => this.salaryStructure.set(null)
    });

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    this.attendanceService.getAll({
      employeeId: id,
      fromDate: fromDate.toISOString().substring(0, 10),
      toDate: toDate.toISOString().substring(0, 10)
    }).subscribe(records => this.attendance.set(records));
  }
}
