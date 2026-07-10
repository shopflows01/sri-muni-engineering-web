import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { JobWorkDC } from '../../../shared/models/api.models';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-detail.html',
})
export class StockDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stockService = inject(StockService);

  dc = signal<JobWorkDC | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDC(id);
    } else {
      this.error.set('Invalid DC ID');
      this.isLoading.set(false);
    }
  }

  loadDC(id: string) {
    this.isLoading.set(true);
    this.stockService.getById(id).subscribe({
      next: (res) => {
        this.dc.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load DC details.');
        this.isLoading.set(false);
      }
    });
  }

  getTotalQty(): number {
    const dcData = this.dc();
    if (!dcData) return 0;
    return dcData.items.reduce((acc, item) => acc + item.qtySent, 0);
  }
}
