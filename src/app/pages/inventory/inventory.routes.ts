import { Routes } from '@angular/router';
import { Inventory } from './inventory';

export default [
    {
        path: '',
        component: Inventory,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./i-dashboard/i-dashboard').then(m => m.IDashboard) },
            { path: 'products', loadComponent: () => import('./i-products/i-products').then(m => m.IProducts) },
            { path: 'products/:id', loadComponent: () => import('./i-products/i-pdetail/i-pdetail').then(m => m.IPdetail) },
            { path: 'categories', loadComponent: () => import('./i-categories/i-categories').then(m => m.ICategories) },
            { path: 'categories/:id', loadComponent: () => import('./i-categories/i-cdetail/i-cdetail').then(m => m.ICdetail) },
            { path: 'modal', loadComponent: () => import('./i-products/i-pmodal/i-modal').then(m => m.IModal) },
        ]
    },
] as Routes;