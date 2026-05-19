// app.notifications.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

export interface Notificacion {
  id: string;
  tipo: string;
  modulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule],
  template: `
    <button type="button" class="layout-topbar-action" (click)="toggle()">
      <i class="pi pi-bell"></i>
      @if (noLeidas() > 0) {
        <span class="notifications-badge">{{ noLeidas() }}</span>
      }
    </button>

    <p-drawer
      [(visible)]="visible"
      position="top"
      [style]="{ height: 'auto', maxHeight: '60vh' }"
      [showCloseIcon]="false"
      styleClass="notifications-drawer"
    >
      <ng-template pTemplate="header">
        <div class="flex align-items-center justify-content-between w-full">
          <div class="flex align-items-center gap-2">
            <span class="font-medium">Notificaciones</span>
            @if (noLeidas() > 0) {
              <span class="text-xs px-2 py-1 border-round"
                style="background: var(--p-primary-100); color: var(--p-primary-700);">
                {{ noLeidas() }} sin leer
              </span>
            }
          </div>
          <div class="flex align-items-center gap-2">
            @if (noLeidas() > 0) {
              <button type="button" class="p-button p-button-text p-button-sm"
                style="font-size: 0.75rem; color: var(--p-text-muted-color);"
                (click)="marcarTodasLeidas()">
                Marcar todas como leídas
              </button>
            }
            <button type="button" class="layout-topbar-action" style="width:2rem; height:2rem;"
              (click)="visible = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
      </ng-template>

      <div style="overflow-y: auto; max-height: calc(60vh - 60px);">
        @if (notificaciones().length === 0) {
          <div class="flex flex-col align-items-center justify-content-center gap-2 py-5">
            <i class="pi pi-bell-slash text-3xl text-muted-color opacity-30"></i>
            <span class="text-sm text-muted-color">Sin notificaciones</span>
          </div>
        }

        @for (n of notificaciones(); track n.id) {
          <div
            class="flex gap-3 px-1 py-3 border-bottom-1 surface-border cursor-pointer notification-item"
            [class.notification-unread]="!n.leida"
            (click)="marcarLeida(n.id)"
          >
            <div class="flex-shrink-0 mt-1">
              <div class="flex align-items-center justify-content-center border-round"
                style="width: 2rem; height: 2rem;"
                [style.background]="getBgColor(n.tipo)">
                <i [class]="'pi ' + getIcon(n.tipo)"
                  style="font-size: 0.85rem;"
                  [style.color]="getIconColor(n.tipo)"></i>
              </div>
            </div>
            <div class="flex flex-col gap-1 flex-1 min-w-0">
              <div class="flex align-items-center justify-content-between gap-2">
                <span class="text-xs font-medium"
                  style="text-transform: uppercase; letter-spacing: 0.05em;"
                  [style.color]="getIconColor(n.tipo)">
                  {{ n.modulo }}
                </span>
                <span class="text-xs text-muted-color flex-shrink-0">
                  {{ n.created_at | date:'d MMM, HH:mm' }}
                </span>
              </div>
              <span class="text-sm" [class.text-muted-color]="n.leida">{{ n.mensaje }}</span>
            </div>
            @if (!n.leida) {
              <div class="flex-shrink-0 flex align-items-center">
                <div style="width: 7px; height: 7px; border-radius: 50%; background: var(--p-primary-500);"></div>
              </div>
            }
          </div>
        }
      </div>
    </p-drawer>
  `,
  styles: [`
    :host { position: relative; }
    .notifications-badge {
      position: absolute;
      top: 4px; right: 4px;
      min-width: 16px; height: 16px;
      border-radius: 99px;
      background: var(--p-red-500);
      color: white;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      pointer-events: none;
    }
    .notification-item:hover { background: var(--p-surface-50); }
    .notification-unread { background: var(--p-surface-50); }
  `]
})
export class AppNotifications {
  visible = false;

  notificaciones = signal<Notificacion[]>([
    {
      id: '1',
      tipo: 'stock_bajo',
      modulo: 'Inventario',
      mensaje: 'El producto "Tornillo 3/8" está por debajo del stock mínimo (quedan 3 unidades).',
      leida: false,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '2',
      tipo: 'sin_stock',
      modulo: 'Inventario',
      mensaje: 'El producto "Cable eléctrico 2.5mm" se ha quedado sin stock.',
      leida: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      tipo: 'movimiento',
      modulo: 'Inventario',
      mensaje: 'Se registró una entrada de 50 unidades de "Pintura blanca 4L".',
      leida: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);

  noLeidas = computed(() => this.notificaciones().filter(n => !n.leida).length);

  toggle() { this.visible = !this.visible; }

  marcarLeida(id: string) {
    this.notificaciones.update(lista =>
      lista.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  }

  marcarTodasLeidas() {
    this.notificaciones.update(lista => lista.map(n => ({ ...n, leida: true })));
  }

  getIcon(tipo: string): string {
    const map: Record<string, string> = {
      stock_bajo: 'pi-exclamation-triangle',
      sin_stock: 'pi-times-circle',
      movimiento: 'pi-arrow-right-arrow-left',
      vencimiento: 'pi-calendar',
    };
    return map[tipo] ?? 'pi-info-circle';
  }

  getBgColor(tipo: string): string {
    const map: Record<string, string> = {
      stock_bajo: 'var(--p-orange-100)',
      sin_stock: 'var(--p-red-100)',
      movimiento: 'var(--p-blue-100)',
      vencimiento: 'var(--p-yellow-100)',
    };
    return map[tipo] ?? 'var(--p-surface-100)';
  }

  getIconColor(tipo: string): string {
    const map: Record<string, string> = {
      stock_bajo: 'var(--p-orange-600)',
      sin_stock: 'var(--p-red-600)',
      movimiento: 'var(--p-blue-600)',
      vencimiento: 'var(--p-yellow-600)',
    };
    return map[tipo] ?? 'var(--p-text-muted-color)';
  }
}