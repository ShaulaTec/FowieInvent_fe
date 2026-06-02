import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/app/core/service/auth.service';

interface MenuSection {
    label?: string;
    separator?: boolean;
    items?: { label: string; icon: string; routerLink: string[] }[];
}

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <div class="flex flex-col h-full">
        <ul class="layout-menu flex-1">
        @for (item of model(); track item.label) {
            @if (!item.separator) {
            <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
            <li class="menu-separator"></li>
            }
        }
        </ul>
        <ul class="layout-menu mt-auto">
        @for (item of soporte(); track item.label) {
            <li app-menuitem [item]="item" [root]="true"></li>
        }
        </ul>
    </div>
`,
})
export class AppMenu {
    authService = inject(AuthService);

    model = computed<MenuSection[]>(() => {
        const tiene = (codigo: string) => this.authService.tienePermiso(codigo);
        return [
            {
                label: 'General',
                items: [
                    { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: ['/system'] },
                ],
            },
            {
                label: 'Módulos',
                items: [
                    ...(tiene('ver_inventario') ? [{ label: 'Inventario', icon: 'pi pi-fw pi-box', routerLink: ['/system/inventory'] }] : []),
                ],
            },
            {
                label: 'Configuración',
                items: [
                    ...(tiene('ver_mi_negocio') || tiene('editar_mi_negocio') ? [{ label: 'Mi negocio', icon: 'pi pi-fw pi-building', routerLink: ['/system/my-business'] }] : []),
                    ...(tiene('ver_rbac') || tiene('gestionar_usuarios') || tiene('gestionar_roles') ? [{ label: 'Usuarios y roles', icon: 'pi pi-fw pi-shield', routerLink: ['/system/rbac'] }] : []),
                ],
            },
        ].filter(section => section.items && section.items.length > 0);
    });

    soporte = computed<MenuSection[]>(() => [
        {
            label: 'Soporte',
            items: [
                { label: 'Soporte Técnico', icon: 'pi pi-fw pi-phone', routerLink: ['/system/support'] },
            ],
        },
    ]);
}