import { Routes } from '@angular/router';
import { Rbac } from './rbac';

export default [
    {
        path: '',
        component: Rbac,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./rbac-dashboard/rbac-dashboard').then(m => m.RbacDashboard) },
            { path: 'roles', loadComponent: () => import('./rbac-roles/rbac-roles').then(m => m.RbacRoles) },
            { path: 'users', loadComponent: () => import('./rbac-users/rbac-users').then(m => m.RbacUsers) },
            { path: 'users/:id', loadComponent: () => import('./rbac-users/urbac-detail/urbac-detail').then(m => m.UrbacDetail) },
        ],
    },
] as Routes;