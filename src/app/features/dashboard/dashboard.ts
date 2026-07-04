import { Component, computed, inject, signal, OnInit, OnDestroy, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardMetrics } from '../../core/services/dashboard.service';
import * as echarts from 'echarts';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [DatePipe]
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private datePipe = inject(DatePipe);
  private router = inject(Router);

  inwardChartEl = viewChild<ElementRef>('inwardChart');
  outwardChartEl = viewChild<ElementRef>('outwardChart');
  rejectionChartEl = viewChild<ElementRef>('rejectionChart');
  revenueChartEl = viewChild<ElementRef>('revenueChart');
  ledgerStatusChartEl = viewChild<ElementRef>('ledgerStatusChart');

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
  private charts: echarts.ECharts[] = [];
  private intervalId: any;

  constructor() {
    this.intervalId = setInterval(() => {
      this.now.set(new Date());
    }, 60000);
  }

  ngOnInit() {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        setTimeout(() => this.renderCharts(data), 100);
      },
      error: () => this.metrics.set(null)
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.charts.forEach(c => c.dispose());
  }

  onMetricClick(metric: string) {
    switch (metric) {
      case 'revenue': this.router.navigate(['/invoices']); break;
      case 'pendingInvoices': this.router.navigate(['/invoices']); break;
      case 'inward': this.router.navigate(['/stock']); break;
      case 'outward': this.router.navigate(['/stock']); break;
      case 'rejected': this.router.navigate(['/stock']); break;
      case 'ledgers': this.router.navigate(['/stock']); break;
      case 'customers': this.router.navigate(['/customers']); break;
      case 'products': this.router.navigate(['/products']); break;
    }
  }

  private renderCharts(data: DashboardMetrics) {
    this.renderLineChart(this.inwardChartEl(), data.dailyInwardChart, 'Daily Inward', '#1E40AF');
    this.renderLineChart(this.outwardChartEl(), data.dailyOutwardChart, 'Daily Outward', '#16A34A');
    this.renderLineChart(this.rejectionChartEl(), data.dailyRejectionChart, 'Daily Rejected', '#DC2626');
    this.renderRevenueChart(data);
    this.renderLedgerStatusChart(data);
  }

  private renderLineChart(el: ElementRef | undefined, chartData: { date: string; quantity: number }[], title: string, color: string) {
    if (!el) return;
    const chart = echarts.init(el.nativeElement);
    this.charts.push(chart);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { 
        type: 'category', 
        data: chartData.map(d => {
          const parts = d.date.split('-');
          return parts.length >= 3 ? `${parts[2]}-${parts[1]}` : d.date;
        }), 
        axisLabel: { fontSize: 10 } 
      },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ data: chartData.map(d => d.quantity), type: 'line', smooth: true, lineStyle: { color }, itemStyle: { color }, areaStyle: { color: color + '20' } }]
    });
  }

  private renderRevenueChart(data: DashboardMetrics) {
    const el = this.revenueChartEl();
    if (!el || !data.monthlyRevenueChart?.length) return;
    const chart = echarts.init(el.nativeElement);
    this.charts.push(chart);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.monthlyRevenueChart.map(d => d.month), axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ data: data.monthlyRevenueChart.map(d => d.revenue), type: 'bar', itemStyle: { color: '#1E40AF' } }]
    });
  }

  private renderLedgerStatusChart(data: DashboardMetrics) {
    const el = this.ledgerStatusChartEl();
    if (!el || !data.ledgerStatusBreakdown?.length) return;
    const chart = echarts.init(el.nativeElement);
    this.charts.push(chart);
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        data: data.ledgerStatusBreakdown.map(d => ({ name: d.status, value: d.count })),
        label: { fontSize: 11 }
      }]
    });
  }
}
