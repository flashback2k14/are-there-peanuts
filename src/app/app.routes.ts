import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Are there peanuts?',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'product/:code',
    loadComponent: () => import('./pages/product/product').then((m) => m.ProductPage),
  },
  { path: '**', redirectTo: '' },
];
