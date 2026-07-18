import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DeliveryChallanService } from '../../../core/services/delivery-challan.service';
import { DeliveryChallan } from '../../../shared/models/api.models';

@Component({
  selector: 'app-delivery-challan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <button (click)="location.back()" class="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            Delivery Challan {{ dc()?.dcNo }}
          </h1>
          <p class="text-sm text-gray-500 mt-1 pl-10">
            Created on {{ dc()?.dcDate | date:'mediumDate' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button [routerLink]="['/delivery-challans', dc()?.id, 'edit']"
            class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors border border-blue-200">
            <span class="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button (click)="viewPdf()" [disabled]="isDownloading()"
            class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200 disabled:opacity-50">
            <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
            {{ isDownloading() ? 'Opening...' : 'PDF' }}
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
        </div>
      } @else if (dc(); as dc) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- DC Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div class="p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>
              <div class="space-y-1">
                <p class="text-sm text-gray-500">To</p>
                <p class="font-medium text-gray-900 text-lg">{{ dc.customerName }}</p>
              </div>
            </div>
            <div class="p-6 bg-gray-50/50">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Document Details</h3>
              <div class="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Your D.C. No.</p>
                  <p class="font-medium text-gray-900">{{ dc.yourDcNo || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Your D.C. Date</p>
                  <p class="font-medium text-gray-900">{{ dc.yourDcDate ? (dc.yourDcDate | date:'mediumDate') : '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">P.O. No. / Cide No.</p>
                  <p class="font-medium text-gray-900">{{ dc.poNo || '-' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="border-t border-gray-200">
            <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700">Line Items</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-gray-50/50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 font-medium w-16">Sl.No.</th>
                    <th class="px-6 py-3 font-medium">Description</th>
                    <th class="px-6 py-3 font-medium text-right">Quantity</th>
                    <th class="px-6 py-3 font-medium text-center">Unit</th>
                    <th class="px-6 py-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (item of dc.items; track item.id; let i = $index) {
                    <tr class="hover:bg-gray-50/50">
                      <td class="px-6 py-4 text-gray-500">{{ i + 1 }}</td>
                      <td class="px-6 py-4">
                        <p class="font-medium text-gray-900">{{ item.partName }}</p>
                        <p class="text-xs text-gray-500">{{ item.partNo }}</p>
                      </td>
                      <td class="px-6 py-4 text-right font-medium text-gray-900">{{ item.quantity }}</td>
                      <td class="px-6 py-4 text-center text-gray-600">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {{ item.unit || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-gray-500">{{ item.remarks || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Remarks Footer -->
          @if (dc.remarks) {
            <div class="p-6 border-t border-gray-200 bg-gray-50/30">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Remarks</h3>
              <p class="text-sm text-gray-700 whitespace-pre-line">{{ dc.remarks }}</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DeliveryChallanDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private dcService = inject(DeliveryChallanService);
  public location = inject(Location);

  dc = signal<DeliveryChallan | null>(null);
  isLoading = signal(true);
  isDownloading = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadDC(id);
      }
    });
  }

  loadDC(id: string) {
    this.isLoading.set(true);
    this.dcService.getById(id).subscribe({
      next: (res) => {
        this.dc.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  viewPdf() {
    const current = this.dc();
    if (!current) return;
    
    this.isDownloading.set(true);
    this.dcService.generateDocument(current.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.isDownloading.set(false);
      },
      error: (err) => {
        console.error('Error generating PDF', err);
        this.isDownloading.set(false);
        alert('Failed to generate PDF');
      }
    });
  }
}
