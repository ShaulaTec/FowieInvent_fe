// src/app/pages/inventory/i-products/i-movimiento-modal/i-movimiento-modal.ts
import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageModule } from 'primeng/message';
import { InventoryService } from '../../../../core/service/inventory.service';
import { Movimiento, Producto } from '../../../../core/models/inventory.models';

@Component({
    selector: 'app-i-movimiento-modal',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DialogModule, ButtonModule,
        InputNumberModule, InputTextModule, SelectButtonModule, MessageModule,
    ],
    templateUrl: './i-movimiento-modal.html',
})
export class IMovimientoModal {
    private inventoryService = inject(InventoryService);

    visible  = input<boolean>(false);
    producto = input<Producto | null>(null);

    closed = output<void>();
    saved  = output<Movimiento>();

    tipo: 'entrada' | 'salida' = 'entrada';
    cantidad = 1;
    motivo = '';
    loading = false;
    error: string | null = null;

    tipoOpciones = [
        { label: 'Entrada', value: 'entrada' },
        { label: 'Salida',  value: 'salida'  },
    ];

    onShow() {
        this.tipo     = 'entrada';
        this.cantidad = 1;
        this.motivo   = '';
        this.error    = null;
        this.loading  = false;
    }

    onClose() { this.closed.emit(); }

    onSave() {
        const p = this.producto();
        if (!p) return;

        if (this.cantidad <= 0) {
            this.error = 'La cantidad debe ser mayor a 0.';
            return;
        }
        if (this.tipo === 'salida' && this.cantidad > p.stock_actual) {
            this.error = `Stock insuficiente. Disponible: ${p.stock_actual} ${p.unidad_medida}.`;
            return;
        }

        this.loading = true;
        this.error   = null;

        this.inventoryService.createMovimiento({
            producto: p.id,
            tipo:     this.tipo,
            cantidad: this.cantidad,
            motivo:   this.motivo.trim(),
        }).subscribe({
            next: mov => {
                this.loading = false;
                this.saved.emit(mov);
            },
            error: () => {
                this.loading = false;
                this.error = 'No se pudo registrar el movimiento. Intenta de nuevo.';
            },
        });
    }
}