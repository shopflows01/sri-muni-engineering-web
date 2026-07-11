import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product';
import { Product } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, ReactiveFormsModule, EmptyState, PaginationComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  router = inject(Router);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  searchControl = new FormControl('');
  page = signal(1);
  pageSize = signal(25);
  totalCount = signal(0);

  ngOnInit() {
    this.loadProducts();
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(s => this.loadProducts(s || ''));
  }

  loadProducts(search = this.searchControl.value || '') {
    this.isLoading.set(true);
    this.productService.getProducts(search, this.page(), this.pageSize()).subscribe({
      next: (res) => { 
        this.products.set(res.items); 
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false); 
      },
      error: () => this.isLoading.set(false)
    });
  }

  getCustomerNames(product: Product): string {
    return product.customers?.map(c => c.customerName).join(', ') || product.customerName || product.customerId || '';
  }
}
