import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./modules/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./modules/auth/register/register').then(m => m.Register)
  },
  {
    path: 'products',
    loadComponent: () => import('./modules/products/product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'cart',
    loadComponent: () => import('./modules/checkout/cart/cart').then(m => m.Cart)
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  }
];
