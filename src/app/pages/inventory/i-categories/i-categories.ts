import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
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
import { ICmodal } from './i-cmodal/i-cmodal';
import { InventoryService } from '../../../core/service/inventory.service';
import { InventoryStateService } from '@/app/core/service/inventory-state.service';
import { ConfirmService } from '../../../core/service/confirm.service';
import { Categoria, Producto } from '../../../core/models/inventory.models';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { ReactivarService } from './reactivar-productos-dialog/reactivar-productos-dialog';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/app/core/service/auth.service';

@Component({
  selector: 'app-i-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule, ButtonModule,
    InputTextModule, IconFieldModule, InputIconModule,
    SkeletonModule, MessageModule, SelectButtonModule, TooltipModule, ICmodal, 
  ],
  templateUrl: './i-categories.html',
  styleUrl: './i-categories.scss',
})
export class ICategories implements OnInit, OnDestroy {

  authService = inject(AuthService)
  private reactivarService = inject(ReactivarService);
  private inventoryService = inject(InventoryService);
  private inventoryState = inject(InventoryStateService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sub = new Subscription();
  private ngZone = inject(NgZone)

  navItems = this.authService.getNavItems('inventory')

  categorias: Categoria[] = [];
  productos: Producto[] = [];
  productosCount: Record<string, number | undefined> = {};
  loading = true;
  error: string | null = null;
  skeletonRows = Array(8);

  modalVisible = false;
  selectedCategoria: Categoria | null = null;

  filtroActivo: 'todos' | 'activos' | 'inactivos' = 'todos';
  filtroOpciones = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' },
  ];

  get categoriasFiltradas(): Categoria[] {
    if (this.filtroActivo === 'activos') return this.categorias.filter(c => c.activo);
    if (this.filtroActivo === 'inactivos') return this.categorias.filter(c => !c.activo);
    return this.categorias;
  }

  ngOnInit() {
    this.loadData();
    this.sub.add(
      this.inventoryState.openCreateCategoria$.subscribe(() => this.openCreate())
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  loadData() {
    this.loading = true;
    this.error = null;
    forkJoin({
      categorias: this.inventoryService.getCategorias(),
      productos: this.inventoryService.getProductos(),
    }).subscribe({
      next: ({ categorias, productos }) => {
        this.categorias = categorias;
        this.productos = productos;
        this.recalcularCount(productos);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar las categorías.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private recalcularCount(productos: Producto[]) {
    this.productosCount = {};
    for (const p of productos) {
      const cid = p.categoria?.id;
      if (cid) this.productosCount[cid] = (this.productosCount[cid] ?? 0) + 1;
    }
  }

  private abrirReactivar(actualizada: Categoria, productosInactivos: Producto[]) {
    this.categorias = this.categorias.map(c =>
      c.id === actualizada.id ? actualizada : c
    );
    this.cdr.detectChanges();

    if (productosInactivos.length > 0) {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.reactivarService.open({
            productos: productosInactivos,
            onDone: (reactivados) => {
              if (reactivados.length > 0) {
                this.productos = this.productos.map(p =>
                  reactivados.find(r => r.id === p.id) ?? p
                );
                this.productosCount[actualizada.id] =
                  this.productos.filter(
                    p => p.categoria.id === actualizada.id && p.activo
                  ).length;
                this.cdr.detectChanges();
              }
            },
          });
        });
      });
    }
  }

  openDetail(categoria: Categoria) {
    this.router.navigate(['/system/inventory/categories', categoria.id], {
      state: { categoria }
    });
  }

  openCreate() {
    this.selectedCategoria = null;
    this.modalVisible = true;
  }

  openEdit(categoria: Categoria) {
    this.selectedCategoria = categoria;
    this.modalVisible = true;
  }

  onModalClosed() {
    this.modalVisible = false;
    this.selectedCategoria = null;
  }

  onModalSaved(categoriaActualizada: Categoria) {
    const categoriaAnterior = this.categorias.find(c => c.id === categoriaActualizada.id);
    const seActivo = !categoriaAnterior?.activo && categoriaActualizada.activo;

    const idx = this.categorias.findIndex(c => c.id === categoriaActualizada.id);
    if (idx >= 0) {
      this.categorias = [
        ...this.categorias.slice(0, idx),
        categoriaActualizada,
        ...this.categorias.slice(idx + 1),
      ];
    } else {
      this.categorias = [categoriaActualizada, ...this.categorias];
      this.productosCount[categoriaActualizada.id] = 0;
    }

    this.modalVisible = false;
    this.selectedCategoria = null;

    if (seActivo) {
      this.inventoryService.reactivarCategoria(categoriaActualizada.id).subscribe({
        next: ({ categoria, productos_inactivos }) => {
          this.abrirReactivar(categoria, productos_inactivos);
        },
        error: () => {
          this.error = 'No se pudo verificar los productos. Intenta de nuevo.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  onDelete(categoria: Categoria) {
    const tieneProductosActivos = (this.productosCount[categoria.id] ?? 0) > 0;

    const ejecutarDelete = () => {
      this.inventoryService.deleteCategoria(categoria.id).subscribe({
        next: () => {
          this.categorias = this.categorias.map(c =>
            c.id === categoria.id ? { ...c, activo: false } : c
          );
          this.productosCount[categoria.id] = 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'No se pudo eliminar. Intenta de nuevo.';
          this.cdr.detectChanges();
        },
      });
    };

    if (tieneProductosActivos) {
      this.confirmService.deleteWithInput({
        nombre: categoria.nombre,
        onAccept: ejecutarDelete,
      });
    } else {
      this.confirmService.delete({
        nombre: categoria.nombre,
        onAccept: ejecutarDelete,
      });
    }
  }

  onReactivarCategoria(categoria: Categoria) {
    this.inventoryService.reactivarCategoria(categoria.id).subscribe({
      next: ({ categoria: actualizada, productos_inactivos }) => {
        this.abrirReactivar(actualizada, productos_inactivos);
      },
      error: () => {
        this.error = 'No se pudo reactivar. Intenta de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }
}