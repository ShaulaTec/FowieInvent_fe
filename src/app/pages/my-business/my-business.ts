import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe, registerLocaleData } from '@angular/common';
import { TenantService } from '@/app/core/service/tenant.service';
import { Tenant, TenantModulo } from '@/app/core/models/tenant.models';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { AppNav, NavItem } from '@/app/layout/component/app.nav';
import { AuthService } from '@/app/core/service/auth.service';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

@Component({
  selector: 'app-my-business',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    MessageModule,
    AppNav,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './my-business.html',
  styleUrl: './my-business.scss',
})
export class MyBusiness implements OnInit {
  private tenantService = inject(TenantService);
  private cdr = inject(ChangeDetectorRef);

  authService = inject(AuthService)

  navItems = this.authService.getModulosRaiz()


  tenant: Tenant | null = null;
  modulos: TenantModulo[] = [];
  loading = true;
  error: string | null = null;
  modalVisible = false;

  ngOnInit() {
    forkJoin({
      tenants: this.tenantService.getTenant(),
      modulos: this.tenantService.getModulos(),
    }).subscribe({
      next: ({ tenants, modulos }) => {
        this.tenant = tenants[0] ?? null;
        this.modulos = modulos;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar la información del negocio.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get diasRestantes(): number {
    if (!this.tenant) return 0;
    const hoy = new Date();
    const vence = new Date(this.tenant.fecha_vencimiento);
    return Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  get estadoSeverity(): 'success' | 'warn' | 'danger' {
    if (!this.tenant) return 'danger';
    if (this.tenant.estado === 'activo') return 'success';
    if (this.tenant.estado === 'suspendido') return 'warn';
    return 'danger';
  }
}