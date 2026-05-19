import { Routes } from '@angular/router';
import { Pos } from './pos';

export default [
    {
        path: '',
        component: Pos,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pos').then(m => m.Pos) },
        ]
    },
] as Routes;