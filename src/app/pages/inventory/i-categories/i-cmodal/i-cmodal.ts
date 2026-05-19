// src/app/pages/inventory/i-categories/i-cmodal/i-cmodal.ts
import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';
import { InventoryService } from '../../../../core/service/inventory.service';
import { Categoria } from '../../../../core/models/inventory.models';

@Component({
    selector: 'app-i-cmodal',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DialogModule, ButtonModule,
        InputTextModule, ToggleSwitchModule, MessageModule,
    ],
    templateUrl: './i-cmodal.html',
})
export class ICmodal {

    private inventoryService = inject(InventoryService);

    // ── I/O ───────────────────────────────────────────────────────────────────
    visible   = input<boolean>(false);
    categoria = input<Categoria | null>(null);

    closed = output<void>();
    saved  = output<Categoria>();

    // ── Estado ────────────────────────────────────────────────────────────────
    loading = false;
    error: string | null = null;

    // ── Form ──────────────────────────────────────────────────────────────────
    nombre = '';
    activo = true;

    get isEdit(): boolean { return !!this.categoria(); }
    get title(): string   { return this.isEdit ? 'Editar categoría' : 'Nueva categoría'; }

    onShow() {
        this.error = null;
        const c = this.categoria();
        if (c) {
            this.nombre = c.nombre;
            this.activo = c.activo;
        } else {
            this.nombre = '';
            this.activo = true;
        }
    }

    onClose() {
        this.closed.emit();
    }

    onSave() {
        if (!this.nombre.trim()) {
            this.error = 'El nombre es obligatorio.';
            return;
        }

        this.loading = true;
        this.error   = null;
        const c = this.categoria();

        if (c) {
            this.inventoryService.updateCategoria(c.id, {
                nombre: this.nombre.trim(),
                activo: this.activo,
            }).subscribe({
                next: updated => { this.loading = false; this.saved.emit(updated); },
                error: ()      => { this.loading = false; this.error = 'Error al guardar. Intenta de nuevo.'; },
            });
        } else {
            this.inventoryService.createCategoria({
                nombre: this.nombre.trim(),
            }).subscribe({
                next: created => { this.loading = false; this.saved.emit(created); },
                error: ()      => { this.loading = false; this.error = 'Error al crear. ¿Ya existe esa categoría?'; },
            });
        }
    }
}