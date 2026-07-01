import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardSummary } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [DatePipe]
})
export class Dashboard implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private datePipe = inject(DatePipe);

  userName = computed(() => {
    const name = this.authService.currentUser()?.username || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  now = signal(new Date());

  greeting = computed(() => {
    const hour = this.now().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 16) return 'Good Afternoon';
    return 'Good Evening';
  });

  currentDateTime = computed(() => {
    return this.datePipe.transform(this.now(), 'EEEE, dd MMMM yyyy | hh:mm a');
  });

  summary = signal<DashboardSummary | null>(null);

  private intervalId: any;

  constructor() {
    this.intervalId = setInterval(() => {
      this.now.set(new Date());
    }, 60000);
  }

  ngOnInit() {
    const today = new Date();
    this.dashboardService.getSummary(today.getMonth() + 1, today.getFullYear()).subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.summary.set(null)
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
