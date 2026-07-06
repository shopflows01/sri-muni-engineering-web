import { Component } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';

@Component({
  selector: 'app-accounts-router',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AccountsRouter {}

const routes: Routes = [
  {
    path: '',
    component: AccountsRouter,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.AccountsDashboard) },
      { path: 'management', loadComponent: () => import('./management/management').then(m => m.AccountsManagement) },
      { path: 'ledgers', loadComponent: () => import('./ledger/ledger-list/ledger-list').then(m => m.LedgerList) },
      { path: 'ledgers/new', loadComponent: () => import('./ledger/ledger-form/ledger-form').then(m => m.LedgerForm) },
      { path: 'ledgers/:id', loadComponent: () => import('./ledger/ledger-detail/ledger-detail').then(m => m.LedgerDetail) },
      { path: 'vouchers', loadComponent: () => import('./voucher/voucher-list/voucher-list').then(m => m.VoucherList) },
      { path: 'vouchers/new', loadComponent: () => import('./voucher/voucher-form/voucher-form').then(m => m.VoucherForm) },
      { path: 'vouchers/:id/edit', loadComponent: () => import('./voucher/voucher-form/voucher-form').then(m => m.VoucherForm) },
      { path: 'vouchers/:id', loadComponent: () => import('./voucher/voucher-detail/voucher-detail').then(m => m.VoucherDetail) },
      { path: 'allocations', loadComponent: () => import('./allocation/allocation-list/allocation-list').then(m => m.AllocationList) },
      { path: 'allocations/new', loadComponent: () => import('./allocation/allocation-form/allocation-form').then(m => m.AllocationForm) },
      { path: 'allocations/:id', loadComponent: () => import('./allocation/allocation-detail/allocation-detail').then(m => m.AllocationDetail) },
    ]
  }
];

export default routes;
