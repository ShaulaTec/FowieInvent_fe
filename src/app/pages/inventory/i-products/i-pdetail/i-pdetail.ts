import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { IModal } from '../i-pmodal/i-modal';
import { InventoryService } from '../../../../core/service/inventory.service';
import { ConfirmService } from '../../../../core/service/confirm.service';
import { InventoryStateService } from '../../../../core/service/inventory-state.service';
import { Producto, Movimiento } from '../../../../core/models/inventory.models';
import { Subscription } from 'rxjs';
import { IMovimientoModal } from '../i-movimiento-modal/i-movimiento-modal';
import { TableModule } from 'primeng/table';
import { NavItem } from '@/app/layout/component/app.nav';

@Component({
    selector: 'app-i-pdetail',
    standalone: true,
    imports: [
        CommonModule, ButtonModule, TagModule,
        SkeletonModule, MessageModule, DividerModule,
        IModal, IMovimientoModal, TableModule,
    ],
    templateUrl: './i-pdetail.html',
})
export class IPdetail implements OnInit, OnDestroy {

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private inventoryService = inject(InventoryService);
    private confirmService = inject(ConfirmService);
    private inventoryState = inject(InventoryStateService);
    private sub = new Subscription();
    private cdr = inject(ChangeDetectorRef);

    navItems: NavItem[] = [
        { label: 'Dashboard', icon: 'pi pi-home', route: '/system/inventory/dashboard' },
        { label: 'Productos', icon: 'pi pi-box', route: '/system/inventory/products' },
        { label: 'Categorías', icon: 'pi pi-tag', route: '/system/inventory/categories' },
    ];

    movimientoVisible = false;

    producto: Producto | null = null;
    movimientos: Movimiento[] = [];
    loadingMovimientos = false;
    loading = true;
    error: string | null = null;
    modalVisible = false;

    ngOnInit() {
        // history.state persiste aunque getCurrentNavigation() ya sea null
        const state = history.state as { producto?: Producto };

        if (state?.producto) {
            this.producto = state.producto;
            this.loading = false;
            this.loadMovimientos(state.producto.id);
        } else {
            const id = this.route.snapshot.paramMap.get('id');
            if (id) this.loadProducto(id);
            else { this.error = 'ID no encontrado.'; this.loading = false; }
        }

        this.sub.add(this.inventoryState.openEditProducto$.subscribe(() => this.openEdit()));
        this.sub.add(this.inventoryState.deleteProducto$.subscribe(() => this.onDelete()));
        this.sub.add(
            this.inventoryState.openMovimiento$.subscribe(() => this.openMovimiento())
        );
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    loadProducto(id: string) {
        this.loading = true;
        this.error = null;
        this.inventoryService.getProducto(id).subscribe({
            next: producto => { this.producto = producto; this.loading = false; this.loadMovimientos(id); },
            error: () => { this.error = 'No se pudo cargar el producto.'; this.loading = false; },
        });
    }

    loadMovimientos(productoId: string) {
        this.loadingMovimientos = true;
        this.inventoryService.getMovimientosByProducto(productoId).subscribe({
            next: movimientos => {
                this.movimientos = movimientos.sort(
                    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );
                this.loadingMovimientos = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadingMovimientos = false;
                this.cdr.detectChanges();
            },
        });
    }

    openEdit() { this.modalVisible = true; }
    onModalClosed() { this.modalVisible = false; }
    onModalSaved(producto: Producto) { this.producto = producto; this.modalVisible = false; }

    onDelete() {
        if (!this.producto) return;
        this.confirmService.delete({
            nombre: this.producto.nombre,
            onAccept: () => {
                this.inventoryService.deleteProducto(this.producto!.id).subscribe({
                    next: () => this.router.navigate(['/inventory/products']),
                    error: () => this.error = 'No se pudo eliminar. Intenta de nuevo.',
                });
            }
        });
    }

    getStockSeverity(): 'success' | 'warn' | 'danger' {
        if (!this.producto) return 'danger';
        if (this.producto.stock_actual === 0) return 'danger';
        if (this.producto.stock_actual <= this.producto.stock_minimo) return 'warn';
        return 'success';
    }

    getStockLabel(): string {
        if (!this.producto) return '';
        if (this.producto.stock_actual === 0) return 'Sin stock';
        if (this.producto.stock_actual <= this.producto.stock_minimo) return 'Stock bajo';
        return 'OK';
    }


    // Agrega métodos:
    openMovimiento() { this.movimientoVisible = true; }
    onMovimientoClosed() { this.movimientoVisible = false; }

    // En onMovimientoSaved, recarga el historial:
    onMovimientoSaved(mov: Movimiento) {
        if (this.producto) {
            this.producto = {
                ...this.producto,
                stock_actual: this.producto.stock_actual +
                    (mov.tipo === 'entrada' ? mov.cantidad : -mov.cantidad),
            };
            this.loadMovimientos(this.producto.id);
        }
        this.movimientoVisible = false;
    }

    goToCategoria() {
        if (!this.producto?.categoria) return;
        this.router.navigate(['/system/inventory/categories', this.producto.categoria.id], {
            state: { categoria: this.producto.categoria }
        });
    }
}