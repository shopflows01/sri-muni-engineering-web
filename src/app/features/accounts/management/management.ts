import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accounts-management',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in max-w-6xl mx-auto pt-6 pb-12">
      <!-- Header Section -->
      <div class="relative bg-white border border-gray-200 rounded-3xl p-8 overflow-hidden shadow-sm">
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-brand/5 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Accounts Management</h1>
            <p class="text-gray-500 mt-2 text-base max-w-xl">Centralized hub for managing customer ledgers, processing voucher entries, and allocating payments efficiently.</p>
          </div>
          <a routerLink="/accounts/dashboard" class="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm self-start md:self-auto group">
            <span class="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Dashboard
          </a>
        </div>
      </div>

      <!-- Action Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <!-- Customer Ledger Card -->
        <a routerLink="/accounts/ledgers" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <span class="material-symbols-outlined text-2xl">auto_stories</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Customer Ledger</h3>
          <p class="text-sm text-gray-500 leading-relaxed flex-grow">Track and manage running balances for all customers. View complete transaction history and statement details.</p>
          <div class="mt-8 pt-4 border-t border-gray-50 text-blue-600 font-semibold flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
            <span>Manage Ledgers</span>
            <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </a>

        <!-- Voucher Entry Card -->
        <a routerLink="/accounts/vouchers" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <span class="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Voucher Entry</h3>
          <p class="text-sm text-gray-500 leading-relaxed flex-grow">Record debit and credit entries, process sales receipts, and maintain accurate accounting journals.</p>
          <div class="mt-8 pt-4 border-t border-gray-50 text-emerald-600 font-semibold flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
            <span>Manage Vouchers</span>
            <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </a>

        <!-- Allocate Payment Card -->
        <a routerLink="/accounts/allocations" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <span class="material-symbols-outlined text-2xl">price_check</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Allocate Payment</h3>
          <p class="text-sm text-gray-500 leading-relaxed flex-grow">Systematically allocate received customer payments to specific outstanding invoices and track settlements.</p>
          <div class="mt-8 pt-4 border-t border-gray-50 text-amber-600 font-semibold flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
            <span>Manage Allocations</span>
            <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </a>
      </div>
    </div>
  `
})
export class AccountsManagement { }


