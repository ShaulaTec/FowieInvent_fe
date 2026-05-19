import { Routes } from '@angular/router';
import { MyBusiness } from './my-business';

export default [
    {
        path: '',
        component: MyBusiness,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./my-business').then(m => m.MyBusiness) },
        ]
    },
] as Routes;