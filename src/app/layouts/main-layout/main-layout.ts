import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  authService = inject(AuthService);

  userName = computed(() => this.authService.currentUser()?.username || 'User');
  userInitial = computed(() => this.userName().charAt(0).toUpperCase());

  mobileMenuOpen = signal(false);
  sidebarExpanded = signal(false);

  toggleMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleSidebar() {
    this.sidebarExpanded.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
