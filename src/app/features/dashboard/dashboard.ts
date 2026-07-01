import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [DatePipe]
})
export class Dashboard implements OnDestroy {
  authService = inject(AuthService);
  datePipe = inject(DatePipe);
  
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
  
  private intervalId: any;
  
  constructor() {
    this.intervalId = setInterval(() => {
      this.now.set(new Date());
    }, 60000); // update every minute
  }
  
  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
