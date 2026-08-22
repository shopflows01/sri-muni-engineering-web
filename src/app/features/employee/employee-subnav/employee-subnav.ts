import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-employee-subnav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex gap-1 overflow-x-auto -mx-1 px-1 mb-6 border-b border-gray-200">
      <a routerLink="/employees/new" routerLinkActive="text-brand border-brand" [routerLinkActiveOptions]="{exact: true}"
        class="whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-brand transition-colors">
        New Employee
      </a>
      <a routerLink="/employees/list" routerLinkActive="text-brand border-brand" [routerLinkActiveOptions]="{exact: true}"
        class="whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-brand transition-colors">
        Employees
      </a>
      <a routerLink="/employees/attendance" routerLinkActive="text-brand border-brand" [routerLinkActiveOptions]="{exact: true}"
        class="whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-brand transition-colors">
        Attendance
      </a>
      <a routerLink="/employees/payroll" routerLinkActive="text-brand border-brand"
        class="whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-brand transition-colors">
        Payroll
      </a>
      <a routerLink="/employees/payslip" routerLinkActive="text-brand border-brand" [routerLinkActiveOptions]="{exact: true}"
        class="whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-brand transition-colors">
        Payslip
      </a>
    </nav>
  `
})
export class EmployeeSubnav {}
