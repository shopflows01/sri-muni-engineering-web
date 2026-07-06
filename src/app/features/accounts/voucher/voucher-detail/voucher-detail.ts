import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { VoucherService, ReceiptVoucher } from '../../../../core/services/voucher.service';

@Component({
  selector: 'app-voucher-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in max-w-4xl mx-auto pt-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/accounts/vouchers" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </a>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ voucher?.voucherNumber || 'Loading...' }}</h1>
              @if (voucher) {
                <span class="px-2 py-1 rounded-full text-xs font-semibold"
                      [ngClass]="voucher.status === 'Posted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                  {{ voucher.status }}
                </span>
              }
            </div>
            <p class="text-sm text-gray-500 mt-1">Customer Receipt &middot; {{ voucher?.receiptDate | date:'dd MMM yyyy' }}</p>
          </div>
        </div>
        
        <div class="flex gap-3">
          @if (voucher?.status === 'Draft') {
            <a [routerLink]="['/accounts/vouchers', voucher?.id, 'edit']" class="btn btn-outline text-gray-600 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </a>
            <button (click)="postVoucher()" [disabled]="posting" class="btn btn-primary flex items-center gap-2">
              @if (posting) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              } @else {
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
              }
              Post Receipt
            </button>
          }
        </div>
      </div>

      @if (loading) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center gap-3 text-gray-500">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          <span>Loading receipt details...</span>
        </div>
      } @else if (voucher) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30">
            <div>
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Receipt Info</h3>
              <div class="space-y-3 text-sm text-gray-900">
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                  <span class="text-gray-500">Customer:</span>
                  <span class="col-span-2 font-medium">{{ voucher.customerName || 'Unknown' }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                  <span class="text-gray-500">Date:</span>
                  <span class="col-span-2 font-medium">{{ voucher.receiptDate | date:'mediumDate' }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                  <span class="text-gray-500">Ref No:</span>
                  <span class="col-span-2 font-medium">{{ voucher.referenceNumber || '-' }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <span class="text-gray-500">Narration:</span>
                  <span class="col-span-2 font-medium">{{ voucher.narration || '-' }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col items-end justify-center bg-green-50 p-6 rounded-lg border border-green-100">
              <span class="text-sm text-green-700 font-medium uppercase tracking-wider">Receipt Amount</span>
              <span class="text-4xl font-bold text-green-700 mt-2">{{ voucher.amount | currency:'INR' }}</span>
              <span class="text-xs text-green-600 mt-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">verified_user</span>
                Payment Recorded
              </span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class VoucherDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private voucherService = inject(VoucherService);

  voucherId = '';
  voucher: ReceiptVoucher | null = null;
  loading = true;
  posting = false;

  ngOnInit() {
    this.voucherId = this.route.snapshot.paramMap.get('id') || '';
    if (this.voucherId) {
      this.loadVoucher();
    }
  }

  loadVoucher() {
    this.loading = true;
    this.voucherService.getVoucher(this.voucherId).subscribe({
      next: (v) => {
        this.voucher = v;
        this.loading = false;
      },
      error: () => {
        alert('Receipt not found');
        this.router.navigate(['/accounts/vouchers']);
      }
    });
  }

  postVoucher() {
    if (!this.voucher || !confirm('Are you sure you want to post this receipt? It cannot be edited once posted.')) return;
    
    this.posting = true;
    this.voucherService.postVoucher(this.voucher.id).subscribe({
      next: () => {
        if (this.voucher) this.voucher.status = 'Posted';
        this.posting = false;
      },
      error: (err) => {
        console.error(err);
        this.posting = false;
      }
    });
  }
}
