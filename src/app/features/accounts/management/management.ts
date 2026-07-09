import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accounts-management',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in max-w-5xl mx-auto pt-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Accounts Management</h1>
          <p class="text-sm text-gray-500 mt-1">Select a module below to manage ledgers, vouchers, and allocations.</p>
        </div>
        <a routerLink="/accounts/dashboard" class="btn btn-outline flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 border-gray-300 hover:bg-gray-50">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Dashboard
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Customer Ledger Card -->
        <a routerLink="/accounts/ledgers" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center hover:shadow-xl hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">auto_stories</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2 relative z-10">Customer Ledger</h3>
          <p class="text-sm text-gray-500 relative z-10">View and create running balances for all customers.</p>
          <div class="mt-6 text-brand font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all relative z-10">
            <span>Manage Ledgers</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </a>

        <!-- Voucher Entry Card -->
        <a routerLink="/accounts/vouchers" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center hover:shadow-xl hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2 relative z-10">Voucher Entry</h3>
          <p class="text-sm text-gray-500 relative z-10">Record sales, receipts, and other accounting entries.</p>
          <div class="mt-6 text-brand font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all relative z-10">
            <span>Manage Vouchers</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </a>

        <!-- Allocate Payment Card -->
        <a routerLink="/accounts/allocations" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center hover:shadow-xl hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">price_check</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2 relative z-10">Allocate Payment</h3>
          <p class="text-sm text-gray-500 relative z-10">Allocate received payments to specific invoices.</p>
          <div class="mt-6 text-brand font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all relative z-10">
            <span>Manage Allocations</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </a>
      </div>
    </div>
  `
})
export class AccountsManagement {}

