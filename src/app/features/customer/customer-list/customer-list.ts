import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService } from '../../../core/services/customer';
import { Customer } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-customer-list',
  imports: [RouterLink, ReactiveFormsModule, EmptyState, PaginationComponent],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerList implements OnInit {
  private customerService = inject(CustomerService);
  router = inject(Router);

  customers = signal<Customer[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  page = signal(1);
  pageSize = signal(25);
  searchControl = new FormControl('');

  ngOnInit() {
    this.loadCustomers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.page.set(1);
      this.loadCustomers();
    });
  }

  loadCustomers() {
    this.isLoading.set(true);
    const search = this.searchControl.value || '';
    this.customerService.getCustomers(search, this.page(), this.pageSize()).subscribe({
      next: (res) => {
        this.customers.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
