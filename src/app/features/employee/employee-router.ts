import { Component } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';

@Component({
  selector: 'app-employee-router',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class EmployeeRouter {}

const routes: Routes = [
  {
    path: '',
    component: EmployeeRouter,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'new', loadComponent: () => import('./employee-form/employee-form').then(m => m.EmployeeForm) },
      { path: 'list', loadComponent: () => import('./employee-list/employee-list').then(m => m.EmployeeList) },
      { path: 'departments', loadComponent: () => import('./department-master/department-master').then(m => m.DepartmentMaster) },
      { path: 'designations', loadComponent: () => import('./designation-master/designation-master').then(m => m.DesignationMaster) },
      { path: 'salary-components', loadComponent: () => import('./salary-component-master/salary-component-master').then(m => m.SalaryComponentMaster) },
      { path: 'salary-structure/:employeeId', loadComponent: () => import('./salary-structure-form/salary-structure-form').then(m => m.SalaryStructureForm) },
      { path: 'attendance', loadComponent: () => import('./attendance/attendance').then(m => m.Attendance) },
      { path: 'payroll', loadComponent: () => import('./payroll-run-list/payroll-run-list').then(m => m.PayrollRunList) },
      { path: 'payroll/new', loadComponent: () => import('./payroll-run-form/payroll-run-form').then(m => m.PayrollRunForm) },
      { path: 'payroll/:id', loadComponent: () => import('./payroll-run-detail/payroll-run-detail').then(m => m.PayrollRunDetail) },
      { path: 'payslip', loadComponent: () => import('./payslip-list/payslip-list').then(m => m.PayslipList) },
      { path: ':id/edit', loadComponent: () => import('./employee-form/employee-form').then(m => m.EmployeeForm) },
      { path: ':id', loadComponent: () => import('./employee-detail/employee-detail').then(m => m.EmployeeDetail) },
    ]
  }
];

export default routes;
