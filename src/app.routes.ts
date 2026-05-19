import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/core/guards/auth.guard';

export const appRoutes: Routes = [
    // ── Pública: landing ─────────────────────────────────────────────────────
    {
        path: '',
        component: Landing,
    },

    // ── Autenticada: sistema ──────────────────────────────────────────────────
    {
        path: 'system',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./app/pages/home/home').then(m => m.Home),
            },
            { 
                path: 'inventory', 
                loadChildren: () => import('./app/pages/inventory/inventory.routes') 
            },
            { 
                path: 'pos', 
                loadChildren: () => import('./app/pages/pos/pos.routes') 
            },
            { 
                path: 'employees', 
                loadChildren: () => import('./app/pages/employees/employees.routes') 
            },
            { 
                path: 'my-business', 
                loadChildren: () => import('./app/pages/my-business/my-business.routes') 
            },
            { 
                path: 'rbac', 
                loadChildren: () => import('./app/pages/rbac/rbac.routes') 
            },
        ],
    },

    // ── Auth ──────────────────────────────────────────────────────────────────
    {
        path: 'auth',
        loadChildren: () => import('./app/pages/auth/auth.routes'),
    },

    // ── Fallback ──────────────────────────────────────────────────────────────
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' },
];