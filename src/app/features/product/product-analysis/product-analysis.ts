import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product';
import { ProductAnalysisResponse } from '../../../shared/models/api.models';

@Component({
  selector: 'app-product-analysis',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './product-analysis.html',
  styleUrl: './product-analysis.css',
})
export class ProductAnalysis implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  analysis = signal<ProductAnalysisResponse | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

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
}
