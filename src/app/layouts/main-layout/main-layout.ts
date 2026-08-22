import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  authService = inject(AuthService);
  private router = inject(Router);

  userName = computed(() => this.authService.currentUser()?.username || 'User');
  userInitial = computed(() => this.userName().charAt(0).toUpperCase());
  userEmail = computed(() => this.authService.currentUser()?.email || 'user@example.com');
  userRole = computed(() => {
    const role = this.authService.currentUser()?.role || 'user';
    return role.charAt(0).toUpperCase() + role.slice(1);
  });

  mobileMenuOpen = signal(false);
  sidebarExpanded = signal(false);
  profileDialogOpen = signal(false);
  employeeMenuOpen = signal(this.router.url.startsWith('/employees'));

  employeeSubLinks = [
    { path: '/employees/new', label: 'New Employee Register' },
    { path: '/employees/list', label: 'Employee List' },
    { path: '/employees/attendance', label: 'Attendance' },
    { path: '/employees/payroll', label: 'Payroll' },
    { path: '/employees/payslip', label: 'Payslip' }
  ];

  toggleEmployeeMenu() {
    this.employeeMenuOpen.update(v => !v);
  }

  toggleMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleSidebar() {
    this.sidebarExpanded.update(v => !v);
  }
  
  openProfileDialog() {
    this.profileDialogOpen.set(true);
    this.closeMenu();
    // Refresh profile when opening dialog
    this.authService.getProfile().subscribe({
      error: (err) => console.error('Failed to fetch profile', err)
    });
  }
  
  closeProfileDialog() {
    this.profileDialogOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.profileDialogOpen.set(false);
  }
}
