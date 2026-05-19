import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../core/service/auth.service';
import { AppNav } from '@/app/layout/component/app.nav';

interface ModuleCard {
    icon: string;
    title: string;
    desc: string;
    status: string;
    active: boolean;
    route: string | null;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, TagModule, DividerModule, AppNav],
    templateUrl: './home.html',
})
export class Home {
    authService = inject(AuthService);

    navItems = this.authService.getModulosRaiz();

    private moduloLabel(modulo: string): string {
        const map: Record<string, string> = {
            inventory: 'Inventario',
            tenants: 'Configuración',
        };
        return map[modulo] ?? modulo;
    }

    private moduloIcon(modulo: string): string {
        const map: Record<string, string> = {
            inventory: 'pi pi-box',
            tenants: 'pi pi-shield',
        };
        return map[modulo] ?? 'pi pi-circle';
    }

    private moduloRuta(modulo: string): string {
        const map: Record<string, string> = {
            inventory: '/system/inventory',
            tenants: '/system/rbac',
        };
        return map[modulo] ?? '/system';
    }

    moduleCards: ModuleCard[] = [
        {
            icon: 'pi-box',
            title: 'Inventario',
            desc: 'Control de productos, movimientos, categorías y alertas de stock.',
            status: 'En desarrollo',
            active: true,
            route: '/system/inventory/',
        },
        {
            icon: 'pi-shopping-cart',
            title: 'Punto de venta',
            desc: 'Registra ventas y descuenta stock automáticamente.',
            status: 'Próximamente',
            active: false,
            route: null,
        },
        {
            icon: 'pi-users',
            title: 'Personal',
            desc: 'Gestión de empleados y trazabilidad de movimientos por usuario.',
            status: 'Próximamente',
            active: false,
            route: null,
        },
    ];
}