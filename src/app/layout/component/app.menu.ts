import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/app/core/service/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul>`,
})
export class AppMenu implements OnInit {
    authService = inject(AuthService);
    model: MenuItem[] = [];

    ngOnInit() {
        const tiene = (codigo: string) => this.authService.tienePermiso(codigo);

        this.model = [
            {
                label: 'General',
                items: [
                    { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: ['/system'] },
                ]
            },
            {
                label: 'Módulos',
                items: [
                    ...(tiene('ver_inventario') ? [{
                        label: 'Inventario',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/system/inventory']
                    }] : []),
                ]
            },
            {
                label: 'Configuración',
                items: [
                    ...(tiene('ver_mi_negocio') || tiene('editar_mi_negocio') ? [
                        { label: 'Mi negocio', icon: 'pi pi-fw pi-building', routerLink: ['/system/my-business'] }
                    ] : []),
                    ...(tiene('ver_rbac') || tiene('gestionar_usuarios') || tiene('gestionar_roles') ? [
                        { label: 'Usuarios y roles', icon: 'pi pi-fw pi-shield', routerLink: ['/system/rbac'] }
                    ] : []),
                ]
            },
        ].filter(section => section.items && section.items.length > 0);
    }
}