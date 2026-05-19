import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ICmodal } from '../i-cmodal/i-cmodal';
import { InventoryService } from '../../../../core/service/inventory.service';
import { ConfirmService } from '../../../../core/service/confirm.service';
import { InventoryStateService } from '../../../../core/service/inventory-state.service';
import { ReactivarService } from '../reactivar-productos-dialog/reactivar-productos-dialog';
import { Categoria, Producto } from '../../../../core/models/inventory.models';
import { Subscription, forkJoin } from 'rxjs';
import { NavItem } from '@/app/layout/component/app.nav';

@Component({
    selector: 'app-i-cdetail',
    standalone: true,
    imports: [
        CommonModule, ButtonModule, SkeletonModule,
        MessageModule, DividerModule, TagModule, TableModule, ICmodal,
    ],
    templateUrl: './i-cdetail.html',
})
export class ICdetail implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private inventoryService = inject(InventoryService);
    private confirmService = inject(ConfirmService);
    private inventoryState = inject(InventoryStateService);
    private reactivarService = inject(ReactivarService);
    private sub = new Subscription();
    private cdr = inject(ChangeDetectorRef);


    navItems: NavItem[] = [
        { label: 'Dashboard', icon: 'pi pi-home', route: '/system/inventory/dashboard' },
        { label: 'Productos', icon: 'pi pi-box', route: '/system/inventory/products' },
        { label: 'Categorías', icon: 'pi pi-tag', route: '/system/inventory/categories' },
    ];

    categoria: Categoria | null = null;
    productos: Producto[] = [];
    loading = true;
    error: string | null = null;
    modalVisible = false;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        const state = history.state as { categoria?: Categoria };

        if (state?.categoria) {
            this.categoria = state.categoria;
            this.loadProductos(state.categoria.id);
        } else if (id) {
            this.loadAll(id);
        } else {
            this.error = 'ID de categoría no encontrado.';
            this.loading = false;
        }

        this.sub.add(this.inventoryState.openEditCategoria$.subscribe(() => this.openEdit()));
        this.sub.add(this.inventoryState.deleteCategoria$.subscribe(() => this.onDelete()));
    }

    ngOnDestroy() { this.sub.unsubscribe(); }

    loadAll(id: string) {
        this.loading = true;
        this.error = null;
        forkJoin({
            categorias: this.inventoryService.getCategorias(),
            productos: this.inventoryService.getProductos(),
        }).subscribe({
            next: ({ categorias, productos }) => {
                this.categoria = categorias.find(c => c.id === id) ?? null;
                if (!this.categoria) {
                    this.error = 'Categoría no encontrada.';
                } else {
                    this.productos = productos.filter(p => p.categoria.id === id);
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.error = 'No se pudo cargar la información.';
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    loadProductos(categoriaId: string) {
        this.loading = true;
        this.inventoryService.getProductos().subscribe({
            next: productos => {
                this.productos = productos.filter(p => p.categoria.id === categoriaId);
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

    openEdit() { this.modalVisible = true; }
    onModalClosed() { this.modalVisible = false; }

    onModalSaved(categoriaActualizada: Categoria) {
        const seActivo = !this.categoria?.activo && categoriaActualizada.activo;
        this.categoria = categoriaActualizada;
        this.modalVisible = false;

        if (seActivo) {
            const inactivos = this.productos.filter(p => !p.activo);
            if (inactivos.length > 0) {
                this.reactivarService.open({
                    productos: inactivos,
                    onDone: (reactivados) => {
                        if (reactivados.length > 0) {
                            this.productos = this.productos.map(p =>
                                reactivados.find(r => r.id === p.id) ?? p
                            );
                        }
                    },
                });
            }
        }
    }

    onDelete() {
        if (!this.categoria) return;
        const tieneProductosActivos = this.productos.some(p => p.activo);

        if (tieneProductosActivos) {
            this.confirmService.deleteWithInput({
                nombre: this.categoria.nombre,
                onAccept: () => {
                    this.inventoryService.deleteCategoria(this.categoria!.id).subscribe({
                        next: () => this.router.navigate(['/system/inventory/categories']),
                        error: () => this.error = 'No se pudo eliminar. Intenta de nuevo.',
                    });
                },
            });
        } else {
            this.confirmService.delete({
                nombre: this.categoria.nombre,
                onAccept: () => {
                    this.inventoryService.deleteCategoria(this.categoria!.id).subscribe({
                        next: () => this.router.navigate(['/system/inventory/categories']),
                        error: () => this.error = 'No se pudo eliminar. Intenta de nuevo.',
                    });
                },
            });
        }
    }

    goToProducto(producto: Producto) {
        this.router.navigate(['/system/inventory/products', producto.id], {
            state: { producto }
        });
    }
}