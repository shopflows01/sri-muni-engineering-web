import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService } from '../../../core/services/customer';
import { Customer } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-customer-list',
  imports: [RouterLink, ReactiveFormsModule, EmptyState],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerList implements OnInit {
  private customerService = inject(CustomerService);
  router = inject(Router);

  customers = signal<Customer[]>([]);
  isLoading = signal(true);
  searchControl = new FormControl('');

  ngOnInit() {
    this.loadCustomers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.loadCustomers(searchTerm || '');
    });
  }

  loadCustomers(search = '') {
    this.isLoading.set(true);
    this.customerService.getCustomers(search).subscribe({
      next: (res) => {
        this.customers.set(res.items);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
