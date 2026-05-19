import { Routes } from '@angular/router';
import { Employees } from './employees';

export default [
    {
        path: '',
        component: Employees,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./employees').then(m => m.Employees) },
        ]
    },
] as Routes;