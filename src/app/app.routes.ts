import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Login } from './features/auth/login/login';
import { CustomerList } from './features/customer/customer-list/customer-list';
import { CustomerForm } from './features/customer/customer-form/customer-form';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'customers', component: CustomerList },
      { path: 'customers/new', component: CustomerForm },
      { path: 'customers/:id', component: CustomerForm },
      { path: 'products', loadComponent: () => import('./features/product/product-list/product-list').then(m => m.ProductList) },
      { path: 'products/new', loadComponent: () => import('./features/product/product-form/product-form').then(m => m.ProductForm) },
      { path: 'products/:id/analysis', loadComponent: () => import('./features/product/product-analysis/product-analysis').then(m => m.ProductAnalysis) },
      { path: 'products/:id', loadComponent: () => import('./features/product/product-form/product-form').then(m => m.ProductForm) },
      { path: 'stock', loadComponent: () => import('./features/stock/stock-ledger/stock-ledger').then(m => m.StockLedger) },
      { path: 'stock/new', loadComponent: () => import('./features/stock/stock-form/stock-form').then(m => m.StockForm) },
      { path: 'stock/:id/edit', loadComponent: () => import('./features/stock/stock-form/stock-form').then(m => m.StockForm) },
      { path: 'stock/:id', loadComponent: () => import('./features/stock/stock-detail/stock-detail').then(m => m.StockDetail) },
      { path: 'invoices', loadComponent: () => import('./features/invoice/invoice-list/invoice-list').then(m => m.InvoiceList) },
      { path: 'invoices/new', loadComponent: () => import('./features/invoice/invoice-form/invoice-form').then(m => m.InvoiceForm) },
      { path: 'invoices/:id/edit', loadComponent: () => import('./features/invoice/invoice-form/invoice-form').then(m => m.InvoiceForm) },
      { path: 'invoices/:id', loadComponent: () => import('./features/invoice/invoice-detail/invoice-detail').then(m => m.InvoiceDetail) },
      { path: 'ewaybill', loadComponent: () => import('./features/ewaybill/eway-router/eway-router').then(m => m.EwayRouter) },
      { path: 'accounts', loadChildren: () => import('./features/accounts/accounts-router') },
      { path: 'delivery-challans', loadComponent: () => import('./features/delivery-challan/delivery-challan-list/delivery-challan-list').then(m => m.DeliveryChallanList) },
      { path: 'delivery-challans/new', loadComponent: () => import('./features/delivery-challan/delivery-challan-form/delivery-challan-form').then(m => m.DeliveryChallanForm) },
      { path: 'delivery-challans/:id/edit', loadComponent: () => import('./features/delivery-challan/delivery-challan-form/delivery-challan-form').then(m => m.DeliveryChallanForm) },
      { path: 'delivery-challans/:id', loadComponent: () => import('./features/delivery-challan/delivery-challan-detail/delivery-challan-detail').then(m => m.DeliveryChallanDetail) },
    ]
  },
  {
    path: 'login',
    component: AuthLayout,
    children: [
      { path: '', component: Login }
    ]
  },
  {
    path: 'signup',
    component: AuthLayout,
    children: [
      { path: '', loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
