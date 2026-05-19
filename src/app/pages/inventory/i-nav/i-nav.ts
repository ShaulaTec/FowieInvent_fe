import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-i-nav',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    templateUrl: './i-nav.html',
})
export class INav {

    constructor(private router: Router, private location: Location) {}

    navItems = [
        { label: 'Dashboard',  icon: 'pi pi-home',  route: '/system/inventory/dashboard' },
        { label: 'Productos',  icon: 'pi pi-box',   route: '/system/inventory/products' },
        { label: 'Categorías', icon: 'pi pi-tag',   route: '/system/inventory/categories' },
    ];

    goBack() {
        this.location.back();
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }
}