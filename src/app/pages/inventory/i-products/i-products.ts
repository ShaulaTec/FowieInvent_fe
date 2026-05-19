import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { IModal } from './i-pmodal/i-modal';
import { InventoryService } from '../../../core/service/inventory.service';
import { ConfirmService } from '../../../core/service/confirm.service';
import { Producto, Movimiento } from '../../../core/models/inventory.models';
import { IMovimientoModal } from './i-movimiento-modal/i-movimiento-modal';
import { InventoryStateService } from '@/app/core/service/inventory-state.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/app/core/service/auth.service';
import { IReports } from './i-reports/i-reports';

@Component({
  selector: 'app-i-products',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule, ButtonModule,
    InputTextModule, IconFieldModule, InputIconModule,
    SkeletonModule, MessageModule, SelectButtonModule, IModal,
    IMovimientoModal, TooltipModule, IReports
  ],
  templateUrl: './i-products.html',
  styleUrl: './i-products.scss',
})
export class IProducts implements OnInit, OnDestroy {


  authService = inject(AuthService)
  private inventoryService = inject(InventoryService);
  private confirmService = inject(ConfirmService);
  private inventoryState = inject(InventoryStateService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private sub = new Subscription();

  navItems = this.authService.getNavItems('inventory');
  productos: Producto[] = [];
  movimientoVisible = false;
  selectedMovimiento: Producto | null = null;
  loading = true;
  error: string | null = null;
  skeletonRows = Array(10);

  modalVisible = false;
  reporteVisible = false;
  selectedProducto: Producto | null = null;

  filtroActivo: 'todos' | 'activos' | 'inactivos' = 'todos';
  filtroOpciones = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' },
  ];

  get productosFiltrados(): Producto[] {
    if (this.filtroActivo === 'activos') return this.productos.filter(p => p.activo);
    if (this.filtroActivo === 'inactivos') return this.productos.filter(p => !p.activo);
    return this.productos;
  }

  ngOnInit() {
    this.loadProductos();
    this.sub.add(
      this.inventoryState.openCreateProducto$.subscribe(() => this.openCreate())
    );
    this.sub.add(
      this.inventoryState.openReporte$.subscribe(() => {
        this.reporteVisible = true;
      })
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  loadProductos() {
    this.loading = true;
    this.error = null;
    this.inventoryService.getProductos().subscribe({
      next: productos => {
        this.productos = productos;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreate() {
    this.selectedProducto = null;
    this.modalVisible = true;
  }

  openEdit(producto: Producto) {
    this.selectedProducto = producto;
    this.modalVisible = true;
  }

  onModalClosed() {
    this.modalVisible = false;
    this.selectedProducto = null;
  }

  openDetail(producto: Producto) {
    this.router.navigate(['/system/inventory/products', producto.id], {
      state: { producto }
    });
  }

  openMovimiento(producto: Producto) {
    this.selectedMovimiento = producto;
    this.movimientoVisible = true;
  }

  onMovimientoSaved(mov: Movimiento) {
    // Actualiza el stock localmente sin recargar
    this.productos = this.productos.map(p =>
      p.id === mov.producto
        ? { ...p, stock_actual: p.stock_actual + (mov.tipo === 'entrada' ? mov.cantidad : -mov.cantidad) }
        : p
    );
    this.movimientoVisible = false;
    this.selectedMovimiento = null;
  }

  onMovimientoClosed() {
    this.movimientoVisible = false;
    this.selectedMovimiento = null;
  }

  onModalSaved(producto: Producto) {
    const idx = this.productos.findIndex(p => p.id === producto.id);
    if (idx >= 0) {
      this.productos = [
        ...this.productos.slice(0, idx),
        producto,
        ...this.productos.slice(idx + 1),
      ];
    } else {
      this.productos = [producto, ...this.productos];
    }
    this.modalVisible = false;
    this.selectedProducto = null;
  }

  onDelete(producto: Producto) {
    this.confirmService.delete({
      nombre: producto.nombre,
      onAccept: () => {
        this.inventoryService.deleteProducto(producto.id).subscribe({
          next: () => {
            this.productos = this.productos.map(p =>
              p.id === producto.id ? { ...p, activo: false } : p
            );
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'No se pudo eliminar. Intenta de nuevo.';
          },
        });
      }
    });
  }

  onReactivar(producto: Producto) {
    this.inventoryService.reactivarProducto(producto.id).subscribe({
      next: (actualizado) => {
        this.productos = this.productos.map(p =>
          p.id === actualizado.id ? actualizado : p
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 409) {
          this.error = err.error?.error ?? 'La categoría está inactiva. Actívala primero desde el dashboard de categorías.';
        } else {
          this.error = 'No se pudo reactivar. Intenta de nuevo.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  getStockSeverity(producto: Producto): 'success' | 'warn' | 'danger' {
    if (producto.stock_actual === 0) return 'danger';
    if (producto.stock_actual <= producto.stock_minimo) return 'warn';
    return 'success';
  }

  getStockLabel(producto: Producto): string {
    if (producto.stock_actual === 0) return 'Sin stock';
    if (producto.stock_actual <= producto.stock_minimo) return 'Stock bajo';
    return 'OK';
  }

  goToCategoria(id: string, categoria: any) {
    this.router.navigate(['/system/inventory/categories', id], {
      state: { categoria }
    })
  }

  abrirReporte() {
    this.reporteVisible = true
  }
}