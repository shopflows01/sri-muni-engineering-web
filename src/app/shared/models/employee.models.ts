export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3
}

export enum EmploymentType {
  Permanent = 1,
  Probation = 2,
  Contract = 3,
  Temporary = 4,
  Apprentice = 5
}

export enum EmploymentStatus {
  Active = 1,
  OnNotice = 2,
  Resigned = 3,
  Terminated = 4,
  Retired = 5
}

export enum AttendanceStatus {
  Present = 1,
  Absent = 2,
  HalfDay = 3,
  Permission = 4,
  Leave = 5,
  Holiday = 6,
  WeekOff = 7
}

export enum SalaryComponentType {
  Earning = 1,
  Deduction = 2
}

export enum SalaryCalculationType {
  Fixed = 1,
  ProRata = 2,
  Percentage = 3
}

export enum PayrollRunStatus {
  Draft = 1,
  Processed = 2,
  Paid = 3
}

export enum PayoutStatus {
  Pending = 1,
  Paid = 2
}

export const GENDER_OPTIONS = [
  { value: Gender.Male, label: 'Male' },
  { value: Gender.Female, label: 'Female' },
  { value: Gender.Other, label: 'Other' }
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: EmploymentType.Permanent, label: 'Permanent' },
  { value: EmploymentType.Probation, label: 'Probation' },
  { value: EmploymentType.Contract, label: 'Contract' },
  { value: EmploymentType.Temporary, label: 'Temporary' },
  { value: EmploymentType.Apprentice, label: 'Apprentice' }
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: EmploymentStatus.Active, label: 'Active' },
  { value: EmploymentStatus.OnNotice, label: 'On Notice' },
  { value: EmploymentStatus.Resigned, label: 'Resigned' },
  { value: EmploymentStatus.Terminated, label: 'Terminated' },
  { value: EmploymentStatus.Retired, label: 'Retired' }
];

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: AttendanceStatus.Present, label: 'Present' },
  { value: AttendanceStatus.Absent, label: 'Absent' },
  { value: AttendanceStatus.HalfDay, label: 'Half Day' },
  { value: AttendanceStatus.Permission, label: 'Permission' },
  { value: AttendanceStatus.Leave, label: 'Leave' },
  { value: AttendanceStatus.Holiday, label: 'Holiday' },
  { value: AttendanceStatus.WeekOff, label: 'Week Off' }
];

export const SALARY_COMPONENT_TYPE_OPTIONS = [
  { value: SalaryComponentType.Earning, label: 'Earning' },
  { value: SalaryComponentType.Deduction, label: 'Deduction' }
];

export const SALARY_CALCULATION_TYPE_OPTIONS = [
  { value: SalaryCalculationType.Fixed, label: 'Fixed Amount' },
  { value: SalaryCalculationType.ProRata, label: 'Pro-rated by attendance' },
  { value: SalaryCalculationType.Percentage, label: '% of Gross Earnings' }
];

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Designation {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  dateOfBirth?: string;
  mobileNo: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfJoining: string;
  dateOfLeaving?: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationName: string;
  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  pan?: string;
  aadhaarNo?: string;
  uan?: string;
  esicNo?: string;
  isDeleted?: boolean;
}

export interface EmployeeAttendance {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  attendanceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  overtimeHours?: number;
  remarks?: string;
}

export interface SalaryComponent {
  id: string;
  code: string;
  name: string;
  componentType: SalaryComponentType;
  calculationType: SalaryCalculationType;
  displayOrder: number;
  isActive: boolean;
}

export interface SalaryStructureItem {
  salaryComponentId: string;
  componentCode: string;
  componentName: string;
  componentType: SalaryComponentType;
  calculationType: SalaryCalculationType;
  amount: number;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  items: SalaryStructureItem[];
  monthlyGross: number;
}

export interface PayrollEmployeeItem {
  componentName: string;
  componentType: SalaryComponentType;
  amount: number;
}

export interface PayrollEmployee {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  permissionDays: number;
  leaveDays: number;
  holidayDays: number;
  weekOffDays: number;
  paidDays: number;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  payoutStatus: PayoutStatus;
  paymentDate?: string;
  items: PayrollEmployeeItem[];
}

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  periodStartDate: string;
  periodEndDate: string;
  status: PayrollRunStatus;
  processedDate?: string;
  remarks?: string;
  employeeCount: number;
  totalNetSalary: number;
  employees: PayrollEmployee[];
}

export interface ProcessPayrollResponse {
  run: PayrollRun;
  warnings: string[];
}

export interface PayslipListItem {
  payrollEmployeeId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  month: number;
  year: number;
  netSalary: number;
  payoutStatus: PayoutStatus;
}

export const MONTH_OPTIONS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

export function monthName(month: number): string {
  return MONTH_OPTIONS.find(m => m.value === month)?.label || String(month);
}

export function optionLabel(options: { value: number; label: string }[], value: number): string {
  return options.find(o => o.value === value)?.label || String(value);
}
