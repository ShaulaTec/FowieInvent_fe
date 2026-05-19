// src/app/layout/component/app.layout.ts
import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppTopbar } from './app.topbar';
import { AppSidebar } from './app.sidebar';
import { AppSpeeddial } from './app.speeddial';
import { AppFooter } from './app.footer';
import { LayoutService } from '@/app/layout/service/layout.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';                                          // ← nuevo
import { ReactivarProductosDialog } from '@/app/pages/inventory/i-categories/reactivar-productos-dialog/reactivar-productos-dialog';
import { ConfirmInputDialog } from '@/app/shared/confirm-input-dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, AppTopbar, AppSidebar, AppSpeeddial,
    RouterModule, AppFooter, ConfirmDialogModule, ToastModule,    // ← añade ToastModule
    ReactivarProductosDialog, ConfirmInputDialog,
  ],
  providers: [],
  template: `
    <div class="layout-wrapper" [ngClass]="containerClass()">
        <app-topbar></app-topbar>
        <app-sidebar></app-sidebar>
        <div class="layout-main-container">
            <div class="layout-main p-4 md:p-6" style="padding-top: 4rem;">
                <router-outlet></router-outlet>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask"></div>
        <app-speeddial></app-speeddial>
        <p-toast position="top-right" />
        <p-confirmdialog />
        <app-reactivar-productos-dialog />
        <app-confirm-input-dialog />
    </div>`,
})
export class AppLayout {
  layoutService = inject(LayoutService);

  constructor() {
    effect(() => {
      const state = this.layoutService.layoutState();
      if (state.mobileMenuActive) {
        document.body.classList.add('blocked-scroll');
      } else {
        document.body.classList.remove('blocked-scroll');
      }
    });
  }

  containerClass = computed(() => {
    const config = this.layoutService.layoutConfig();
    const state  = this.layoutService.layoutState();
    return {
      'layout-overlay':          config.menuMode === 'overlay',
      'layout-static':           config.menuMode === 'static',
      'layout-static-inactive':  state.staticMenuDesktopInactive && config.menuMode === 'static',
      'layout-overlay-active':   state.overlayMenuActive,
      'layout-mobile-active':    state.mobileMenuActive,
    };
  });
}