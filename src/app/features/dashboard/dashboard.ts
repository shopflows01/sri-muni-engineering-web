import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardMetrics } from '../../core/services/dashboard.service';

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

  metrics = signal<DashboardMetrics | null>(null);

  private intervalId: any;

  constructor() {
    this.intervalId = setInterval(() => {
      this.now.set(new Date());
    }, 60000);
  }

  ngOnInit() {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => this.metrics.set(data),
      error: () => this.metrics.set(null)
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
