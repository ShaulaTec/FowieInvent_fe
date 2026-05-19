import { Component, inject, ChangeDetectorRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { InventoryService } from '@/app/core/service/inventory.service';
import { AuthService } from '@/app/core/service/auth.service';
import { Movimiento, Producto } from '@/app/core/models/inventory.models';

interface Resumen {
  total: number;
  entradas: number;
  salidas: number;
  productosDistintos: number;
}

@Component({
  selector: 'app-i-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DialogModule, ButtonModule, DatePickerModule, SelectModule,
    MessageModule, SkeletonModule, TagModule, TableModule, DividerModule,
  ],
  templateUrl: './i-reports.html',
  styleUrl:    './i-reports.scss',
})
export class IReports {

  authService      = inject(AuthService);
  private svc      = inject(InventoryService);
  private cdr      = inject(ChangeDetectorRef);


  // ── Filtros ──────────────────────────────────────────────────────────────
  desde   = this.hace30Dias();
  hasta   = new Date();
  hoy     = new Date();
  productoSeleccionado: Producto | null = null;
  productos: Producto[] = [];

  // ── Estado ───────────────────────────────────────────────────────────────
  movimientos:     Movimiento[] = [];
  resumen:         Resumen | null = null;
  loading          = false;
  descargando      = false;
  error:           string | null = null;
  previsualizando  = false;
  skeletonRows     = Array(5);

  visible = input<boolean>(false);
  closed = output<void>()

  // ── Ciclo de vida ────────────────────────────────────────────────────────
  // Los productos se cargan cuando el padre abre el dialog
  cargarProductos() {
    if (this.productos.length) return;   // ya cargados
    this.svc.getProductos().subscribe({
      next: p => { this.productos = p; this.cdr.detectChanges(); },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private hace30Dias(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }

  private toISO(d: Date) {
    return d.toISOString().split('T')[0];
  }

  private get params() {
    return {
      desde:    this.toISO(this.desde),
      hasta:    this.toISO(this.hasta),
      producto: this.productoSeleccionado?.id,
    };
  }

  private validar(): boolean {
    if (this.desde > this.hasta) {
      this.error = '"Desde" no puede ser mayor que "Hasta".';
      return false;
    }
    this.error = null;
    return true;
  }

  // ── Acciones ─────────────────────────────────────────────────────────────
  previsualizar() {
    if (!this.validar()) return;
    this.loading        = true;
    this.previsualizando = true;

    this.svc.getMovimientos(this.params).subscribe({
      next: movs => {
        this.movimientos = movs;
        this.resumen     = this.calcResumen(movs);
        this.loading     = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'No se pudo cargar la vista previa.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  descargarPDF() {
    if (!this.validar()) return;
    this.descargando = true;

    this.svc.descargarReportePDF(this.params).subscribe({
      next: blob => {
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `movimientos_${this.params.desde}_${this.params.hasta}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.error       = err.status === 403
          ? 'No tienes permiso para generar reportes.'
          : 'No se pudo generar el PDF.';
        this.descargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  resetear() {
    this.desde                = this.hace30Dias();
    this.hasta                = new Date();
    this.productoSeleccionado = null;
    this.movimientos          = [];
    this.resumen              = null;
    this.previsualizando      = false;
    this.error                = null;
  }

  cerrar() {
    this.resetear();
    this.closed.emit();
  }

  // ── Cálculo resumen ──────────────────────────────────────────────────────
  private calcResumen(movs: Movimiento[]): Resumen {
    const entradas = movs.filter(m => m.tipo === 'entrada').length;
    return {
      total:              movs.length,
      entradas,
      salidas:            movs.length - entradas,
      productosDistintos: new Set(movs.map(m => m.producto)).size,
    };
  }

  getTipoSeverity(tipo: string): 'success' | 'danger' {
    return tipo === 'entrada' ? 'success' : 'danger';
  }
}