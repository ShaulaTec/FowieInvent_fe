import { Component, inject, HostListener } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '@/app/layout/service/layout.service';
import { DrawerModule } from 'primeng/drawer';
import { AuthService } from '@/app/core/service/auth.service';
import { AppNotifications } from './app.notifications';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, DrawerModule, AppNotifications],
    template: `
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/system">
                <span>FowieInvent</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">

                <app-notifications />

                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>

                <div class="relative">
                    <button type="button" class="layout-topbar-action layout-topbar-action-highlight"
                        (click)="toggleConfig($event)">
                        <i class="pi pi-palette"></i>
                    </button>
                    @if (configVisible) {
                    <app-configurator />
                    }
                </div>

            </div>

            <div class="relative">
                <button class="layout-topbar-menu-button layout-topbar-action"
                    (click)="toggleMenu($event)">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                @if (menuVisible) {
                <div class="layout-topbar-menu">
                    <div class="layout-topbar-menu-content">

                        @if (authService.currentUser(); as user) {
                        <div class="layout-topbar-action" style="cursor:default; gap: 0.5rem;">
                            <div style="width:2rem; height:2rem; border-radius:50%; background:var(--p-primary-500);
                                display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                <span style="color:white; font-size:0.7rem; font-weight:700;">
                                    {{ user.email[0].toUpperCase() }}
                                </span>
                            </div>
                            <div style="display:flex; flex-direction:column; align-items:flex-start; line-height:1.2;">
                                <span style="font-size:0.8rem; font-weight:600;">{{ user.email }}</span>
                                <span style="font-size:0.7rem; opacity:0.6;">{{ user.rol }}</span>
                            </div>
                        </div>
                        }

                        <button type="button" class="layout-topbar-action" (click)="logout()"
                            style="color: var(--p-red-500);">
                            <i class="pi pi-sign-out"></i>
                            <span>Salir</span>
                        </button>

                    </div>
                </div>
                }
            </div>

        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    configVisible = false;
    menuVisible = false;

    layoutService = inject(LayoutService);
    authService = inject(AuthService);

    toggleDarkMode() {
        this.layoutService.layoutConfig.update(state => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    toggleConfig(event: MouseEvent) {
        event.stopPropagation();
        this.configVisible = !this.configVisible;
        this.menuVisible = false;
    }

    toggleMenu(event: MouseEvent) {
        event.stopPropagation();
        this.menuVisible = !this.menuVisible;
        this.configVisible = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('app-topbar')) {
            this.configVisible = false;
            this.menuVisible = false;
        }
    }

    logout() {
        this.authService.logout();
    }
}