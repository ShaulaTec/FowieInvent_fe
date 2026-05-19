import { Routes } from '@angular/router';
import { Rbac } from './rbac';

export default [
    {
        path: '',
        component: Rbac,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./rbac-dashboard/rbac-dashboard').then(m => m.RbacDashboard) },
            { path: 'users', loadComponent: ()=> import('./rbac-users/rbac-users').then(m=> m.RbacUsers)},
            { path: 'roles', loadComponent: ()=> import('./rbac-roles/rbac-roles').then(m=> m.RbacRoles)},
        ]
    },
] as Routes;