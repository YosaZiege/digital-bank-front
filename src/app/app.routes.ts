import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'customers',
    loadComponent: () => import('./components/customers/customers').then((m) => m.Customers),
    canActivate: [authGuard],
  },
  {
    path: 'customers/new',
    loadComponent: () =>
      import('./components/new-customer/new-customer').then((m) => m.NewCustomer),
    canActivate: [authGuard],
  },
  {
    path: 'accounts',
    loadComponent: () => import('./components/accounts/accounts').then((m) => m.Accounts),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/customers' },
];
