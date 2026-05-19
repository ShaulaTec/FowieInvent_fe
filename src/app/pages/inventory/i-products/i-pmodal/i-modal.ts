// src/app/pages/inventory/i-modal/i-modal.ts
import { Component, OnInit, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { InventoryService } from '../../../../core/service/inventory.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import {
    Categoria,
    Producto,
    CreateProductoDto,
    UpdateProductoDto,
} from '../../../../core/models/inventory.models';

@Component({
    selector: 'app-i-modal',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DialogModule, ButtonModule,
        InputTextModule, InputNumberModule, SelectModule, MessageModule, ToggleSwitchModule,
    ],
    templateUrl: './i-modal.html',
    styleUrl: './i-modal.scss',
})
export class IModal implements OnInit {

    private inventoryService = inject(InventoryService);

    // ── I/O ───────────────────────────────────────────────────────────────────
    visible = input<boolean>(false);
    producto = input<Producto | null>(null);

    closed = output<void>();
    saved = output<Producto>();

    // ── Estado ────────────────────────────────────────────────────────────────
    categorias: Categoria[] = [];
    loading = false;
    error: string | null = null;

    // Inline nueva categoría
    showNuevaCategoria = false;
    nuevaCategoriaName = '';
    loadingCategoria = false;
    errorCategoria: string | null = null;

    // ── Form ──────────────────────────────────────────────────────────────────
    nombre = '';
    categoria_id = '';
    unidad_medida = '';
    stock_actual = 0;
    stock_minimo = 0;
    activo = true;

    get isEdit(): boolean { return !!this.producto(); }
    get title(): string { return this.isEdit ? 'Editar producto' : 'Nuevo producto'; }

    ngOnInit() {
        this.loadCategorias();
    }

    loadCategorias() {
        this.inventoryService.getCategorias().subscribe({
            next: cats => this.categorias = cats,
        });
    }

    onShow() {
        this.error = null;
        this.cancelNuevaCategoria();
        const p = this.producto();
        if (p) {
            this.nombre = p.nombre;
            this.categoria_id = p.categoria.id;
            this.unidad_medida = p.unidad_medida;
            this.stock_actual = p.stock_actual;
            this.stock_minimo = p.stock_minimo;
            this.activo = p.activo
        } else {
            this.nombre = '';
            this.categoria_id = '';
            this.unidad_medida = '';
            this.stock_actual = 0;
            this.stock_minimo = 0;
            this.activo = true
        }
    }

    // ── Inline categoría ──────────────────────────────────────────────────────

    toggleNuevaCategoria() {
        this.showNuevaCategoria = !this.showNuevaCategoria;
        this.nuevaCategoriaName = '';
        this.errorCategoria = null;
    }

    cancelNuevaCategoria() {
        this.showNuevaCategoria = false;
        this.nuevaCategoriaName = '';
        this.errorCategoria = null;
    }

    crearCategoria() {
        const nombre = this.nuevaCategoriaName.trim();
        if (!nombre) {
            this.errorCategoria = 'Escribe un nombre para la categoría.';
            return;
        }

        this.loadingCategoria = true;
        this.errorCategoria = null;

        this.inventoryService.createCategoria({ nombre }).subscribe({
            next: cat => {
                this.categorias = [...this.categorias, cat];
                this.categoria_id = cat.id;
                this.loadingCategoria = false;
                this.cancelNuevaCategoria();
            },
            error: () => {
                this.loadingCategoria = false;
                this.errorCategoria = 'No se pudo crear. ¿Ya existe esa categoría?';
            }
        });
    }

    // ── Guardar producto ──────────────────────────────────────────────────────

    onClose() {
        this.closed.emit();
    }

    onSave() {
        if (!this.nombre || !this.categoria_id || !this.unidad_medida) {
            this.error = 'Nombre, categoría y unidad de medida son obligatorios.';
            return;
        }

        this.loading = true;
        this.error = null;
        const p = this.producto();

        if (p) {
            const dto: UpdateProductoDto = {
                nombre: this.nombre,
                categoria_id: this.categoria_id,
                unidad_medida: this.unidad_medida,
                stock_minimo: this.stock_minimo,
                activo: this.activo,
            };
            this.inventoryService.updateProducto(p.id, dto).subscribe({
                next: updated => { this.loading = false; this.saved.emit(updated); },
                error: () => { this.loading = false; this.error = 'Error al guardar. Intenta de nuevo.'; },
            });
        } else {
            const dto: CreateProductoDto = {
                nombre: this.nombre,
                categoria_id: this.categoria_id,
                unidad_medida: this.unidad_medida,
                stock_actual: this.stock_actual,
                stock_minimo: this.stock_minimo,
            };
            this.inventoryService.createProducto(dto).subscribe({
                next: created => { this.loading = false; this.saved.emit(created); },
                error: () => { this.loading = false; this.error = 'Error al crear. Intenta de nuevo.'; },
            });
        }
    }
}