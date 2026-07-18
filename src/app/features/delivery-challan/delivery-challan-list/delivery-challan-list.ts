import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DeliveryChallanService } from '../../../core/services/delivery-challan.service';
import { DeliveryChallan } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-delivery-challan-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, EmptyState, PaginationComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 class="text-2xl font-bold text-brand">Delivery Challans</h1>
          <p class="text-gray-500 text-sm mt-1">Manage outward dispatch documents</p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:w-64">
            <input type="text" [formControl]="searchControl" placeholder="Search by DC No or Customer..."
              class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none transition-all text-sm">
          </div>
          <button routerLink="/delivery-challans/new"
            class="bg-brand hover:bg-brand-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            Create DC
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="py-12 flex justify-center">
          <div class="w-8 h-8 border-4 border-brand-muted border-t-brand rounded-full animate-spin"></div>
        </div>
      } @else if (dcs().length === 0) {
        <app-empty-state 
          title="No Delivery Challans" 
          message="You haven't created any Delivery Challans yet." 
          actionLabel="Create DC"
          (action)="router.navigate(['/delivery-challans/new'])">
        </app-empty-state>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th class="px-6 py-4 font-medium">DC No</th>
                <th class="px-6 py-4 font-medium">Date</th>
                <th class="px-6 py-4 font-medium">Customer</th>
                <th class="px-6 py-4 font-medium">Your DC No</th>
                <th class="px-6 py-4 font-medium">PO No</th>
                <th class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (dc of filteredDcs(); track dc.id) {
                <tr class="hover:bg-gray-50/50">
                  <td class="px-6 py-4 font-medium text-brand">{{ dc.dcNo }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ dc.dcDate | date:'mediumDate' }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ dc.customerName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ dc.yourDcNo || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ dc.poNo || '-' }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button [routerLink]="['/delivery-challans', dc.id]"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs rounded-md transition-colors border border-gray-200 shadow-sm">
                        <span class="material-symbols-outlined text-[16px]">visibility</span>
                        View
                      </button>
                      <button [routerLink]="['/delivery-challans', dc.id, 'edit']"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-md transition-colors border border-blue-200 shadow-sm">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </button>
                      <button (click)="viewPdf(dc)" [disabled]="isDownloading() === dc.id"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs rounded-md transition-colors border border-red-200 shadow-sm disabled:opacity-50">
                        <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        {{ isDownloading() === dc.id ? '...' : 'PDF' }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <app-pagination [page]="page()" [pageSize]="pageSize()" [totalCount]="totalCount()"
            (pageChange)="page.set($event)" (pageSizeChange)="pageSize.set($event)">
          </app-pagination>
        </div>
      }
    </div>
  `
})
export class DeliveryChallanList implements OnInit {
  private dcService = inject(DeliveryChallanService);
  router = inject(Router);

  dcs = signal<DeliveryChallan[]>([]);
  isLoading = signal(true);
  isDownloading = signal<string | null>(null);
  searchControl = new FormControl('');

  page = signal(1);
  pageSize = signal(10);
  
  filteredDcs = computed(() => {
    const term = (this.searchControl.value || '').toLowerCase();
    let filtered = this.dcs();
    
    if (term) {
      filtered = filtered.filter(dc => 
        dc.dcNo.toLowerCase().includes(term) || 
        dc.customerName.toLowerCase().includes(term)
      );
    }
    
    const startIndex = (this.page() - 1) * this.pageSize();
    return filtered.slice(startIndex, startIndex + this.pageSize());
  });

  totalCount = computed(() => {
    const term = (this.searchControl.value || '').toLowerCase();
    if (!term) return this.dcs().length;
    
    return this.dcs().filter(dc => 
      dc.dcNo.toLowerCase().includes(term) || 
      dc.customerName.toLowerCase().includes(term)
    ).length;
  });

  ngOnInit() {
    this.loadDCs();
    this.searchControl.valueChanges.subscribe(() => {
      this.page.set(1);
    });
  }

  loadDCs() {
    this.isLoading.set(true);
    this.dcService.getAll().subscribe({
      next: (data) => {
        this.dcs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading Delivery Challans', err);
        this.isLoading.set(false);
      }
    });
  }

  viewPdf(dc: DeliveryChallan) {
    this.isDownloading.set(dc.id);
    this.dcService.generateDocument(dc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.isDownloading.set(null);
      },
      error: (err) => {
        console.error('Error generating PDF', err);
        this.isDownloading.set(null);
        alert('Failed to generate PDF');
      }
    });
  }
}
