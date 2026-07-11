import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product';
import { ProductAnalysisResponse } from '../../../shared/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-product-analysis',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './product-analysis.html',
  styleUrl: './product-analysis.css',
})
export class ProductAnalysis implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  analysis = signal<ProductAnalysisResponse | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Sales Pagination
  salesPage = signal(1);
  salesPageSize = signal(10);
  paginatedSales = computed(() => {
    const data = this.analysis()?.recentInvoiceHistory || [];
    const startIndex = (this.salesPage() - 1) * this.salesPageSize();
    return data.slice(startIndex, startIndex + this.salesPageSize());
  });

  // Production Pagination
  prodPage = signal(1);
  prodPageSize = signal(10);
  paginatedProduction = computed(() => {
    const data = this.analysis()?.recentProductionHistory || [];
    const startIndex = (this.prodPage() - 1) * this.prodPageSize();
    return data.slice(startIndex, startIndex + this.prodPageSize());
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductAnalysis(id).subscribe({
        next: (data) => {
          this.analysis.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('Failed to load product analysis');
          this.isLoading.set(false);
        }
      });
    }
  }

  getCustomerNames(info: any): string {
    return info.customers?.map((c: any) => c.customerName).join(', ') || info.customerName || info.customerId || 'N/A';
  }

  // Export State
  showExportDialog = signal(false);
  exportFromDate = signal('');
  exportToDate = signal('');
  isExporting = signal(false);

  openExportDialog() {
    this.showExportDialog.set(true);
  }

  closeExportDialog() {
    this.showExportDialog.set(false);
  }

  submitExport() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    
    this.isExporting.set(true);
    this.productService.exportAnalysisReport(id, this.exportFromDate(), this.exportToDate()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.isExporting.set(false);
        this.closeExportDialog();
      },
      error: () => {
        alert('Failed to generate report.');
        this.isExporting.set(false);
      }
    });
  }
}
