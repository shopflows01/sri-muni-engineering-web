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
          <a routerLink="/accounts/vouchers" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium"><span class="material-symbols-outlined text-[20px]">arrow_back</span>Back</a>
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
            <a [routerLink]="['/accounts/vouchers', voucher?.voucherId, 'edit']" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium">
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
        <div class="relative w-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.08)]">
          <!-- Outer mask: Middle notches -->
          <div style="
               -webkit-mask-image: radial-gradient(circle at 66.666667% 0px, transparent 14px, black 14.5px), radial-gradient(circle at 66.666667% 100%, transparent 14px, black 14.5px);
               -webkit-mask-size: 100% 60%, 100% 60%;
               -webkit-mask-position: top, bottom;
               -webkit-mask-repeat: no-repeat;
               mask-image: radial-gradient(circle at 66.666667% 0px, transparent 14px, black 14.5px), radial-gradient(circle at 66.666667% 100%, transparent 14px, black 14.5px);
               mask-size: 100% 60%, 100% 60%;
               mask-position: top, bottom;
               mask-repeat: no-repeat;
               ">
            <!-- Inner mask: Wavy outer border -->
            <div class="bg-white flex w-full overflow-hidden"
                 style="
                   -webkit-mask-image: linear-gradient(black, black), radial-gradient(circle at 8px 8px, transparent 5px, black 5.5px);
                   -webkit-mask-size: calc(100% - 12px) calc(100% - 12px), 16px 16px;
                   -webkit-mask-position: center center, -8px -8px;
                   -webkit-mask-repeat: no-repeat, repeat;
                   mask-image: linear-gradient(black, black), radial-gradient(circle at 8px 8px, transparent 5px, black 5.5px);
                   mask-size: calc(100% - 12px) calc(100% - 12px), 16px 16px;
                   mask-position: center center, -8px -8px;
                   mask-repeat: no-repeat, repeat;
                 ">
            
            <!-- Left side Ticket styling -->
            <div class="w-2/3 p-8 relative" style="border-right: 2px dashed #e5e7eb;">

              <div class="flex justify-between items-start mb-6 pb-4">
                <div>
                  <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Receipt Details</h3>
                  <h2 class="text-2xl font-bold text-gray-900">{{ voucher.voucherNumber }}</h2>
                </div>
                <span class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                      [ngClass]="voucher.voucherType === 'Receipt' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'">
                  {{ voucher.voucherType || 'Receipt' }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div>
                  <span class="block text-xs text-gray-400 font-medium uppercase mb-1">Customer</span>
                  <span class="block font-semibold text-gray-900 text-base">{{ voucher.customerName || 'Unknown' }}</span>
                </div>
                <div>
                  <span class="block text-xs text-gray-400 font-medium uppercase mb-1">Date</span>
                  <span class="block font-semibold text-gray-900 text-base">{{ voucher.receiptDate | date:'mediumDate' }}</span>
                </div>
                <div>
                  <span class="block text-xs text-gray-400 font-medium uppercase mb-1">Reference No</span>
                  <span class="block font-semibold text-gray-900 text-base">{{ voucher.referenceNumber || 'N/A' }}</span>
                </div>
                <div>
                  <span class="block text-xs text-gray-400 font-medium uppercase mb-1">Narration</span>
                  <span class="block font-medium text-gray-800">{{ voucher.narration || '-' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Right side Ticket styling -->
            <div class="w-1/3 relative flex flex-col justify-center items-center text-center p-8"
                 [ngClass]="voucher.voucherType === 'Receipt' ? 'bg-green-100' : 'bg-red-100'">
              <span class="text-xs font-bold uppercase tracking-widest mb-2"
                    [ngClass]="voucher.voucherType === 'Receipt' ? 'text-green-600' : 'text-red-600'">
                Amount
              </span>
              <span class="text-4xl font-extrabold tracking-tight drop-shadow-sm"
                    [ngClass]="voucher.voucherType === 'Receipt' ? 'text-green-700' : 'text-red-700'">
                {{ voucher.amount | currency:'INR' }}
              </span>
              
              <div class="mt-6 flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-white"
                     [ngClass]="voucher.voucherType === 'Receipt' ? 'text-green-500' : 'text-red-500'">
                  <span class="material-symbols-outlined text-[28px]">
                    {{ voucher.voucherType === 'Receipt' ? 'south_west' : 'north_east' }}
                  </span>
                </div>
                <span class="text-xs font-semibold uppercase tracking-wider"
                      [ngClass]="voucher.voucherType === 'Receipt' ? 'text-green-600' : 'text-red-600'">
                  {{ voucher.voucherType === 'Receipt' ? 'Payment Received' : 'Payment Sent' }}
                </span>
              </div>
            </div>
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
    this.voucherService.postVoucher(this.voucher.voucherId).subscribe({
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


