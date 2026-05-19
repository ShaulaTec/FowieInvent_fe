import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { InventoryService } from '@/app/core/service/inventory.service';
import {
    DashboardData,
    ProductoSinMovimiento,
    ProductoBajoStock,
} from '@/app/core/models/inventory.models';

@Component({
    selector: 'app-i-dashboard',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, CardModule, TableModule, TagModule,
        SkeletonModule, MessageModule, SelectButtonModule,
        TooltipModule, ProgressBarModule,
    ],
    templateUrl: './i-dashboard.html',
    styleUrl: './i-dashboard.scss',
})
export class IDashboard implements OnInit {

    private svc    = inject(InventoryService);
    private cdr    = inject(ChangeDetectorRef);
    private router = inject(Router);

    data:    DashboardData | null = null;
    loading  = true;
    error:   string | null = null;

    diasOpciones = [
        { label: '7 d',  value: 7  },
        { label: '30 d', value: 30 },
        { label: '90 d', value: 90 },
    ];
    diasSeleccionados = 30;

    skeletonRows = Array(5);

    ngOnInit() {
        this.cargar();
    }

    cargar() {
        this.loading = true;
        this.error   = null;
        this.svc.getDashboard(this.diasSeleccionados).subscribe({
            next: d => {
                this.data    = d;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.error   = 'No se pudo cargar el dashboard.';
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    onDiasChange() {
        this.cargar();
    }

    // ── Servicio ──────────────────────────────────────────────────────────
    getServicioSeverity(): 'success' | 'warn' | 'danger' {
        const d = this.data?.servicio.dias_restantes ?? 0;
        if (d <= 0)  return 'danger';
        if (d <= 10) return 'warn';
        return 'success';
    }

    getServicioLabel(): string {
        const d = this.data?.servicio.dias_restantes ?? 0;
        if (d <= 0)  return 'Vencido';
        if (d <= 10) return 'Por vencer';
        return 'Activo';
    }

    // ── Navegación ────────────────────────────────────────────────────────
    irAProducto(id: string) {
        this.router.navigate(['/system/inventory/products', id]);
    }

    // ── Stock progress ────────────────────────────────────────────────────
    getStockPct(p: ProductoBajoStock): number {
        if (p.stock_minimo === 0) return 100;
        return Math.min(100, Math.round((p.stock_actual / p.stock_minimo) * 100));
    }

    getProgressSeverity(p: ProductoBajoStock): string {
        const pct = this.getStockPct(p);
        if (pct === 0)   return 'danger';
        if (pct <= 50)   return 'warn';
        return 'info';
    }
}