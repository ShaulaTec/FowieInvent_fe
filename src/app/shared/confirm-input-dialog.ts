// src/app/shared/confirm-input-dialog/confirm-input-dialog.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ConfirmService, DeleteWithInputOptions } from '../core/service/confirm.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-confirm-input-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, MessageModule],
    template: `
        <p-dialog
            header="¿Eliminar?"
            [visible]="visible"
            (visibleChange)="!$event && onCancel()"
            [modal]="true"
            [draggable]="false"
            [resizable]="false"
            styleClass="w-full"
            [style]="{ maxWidth: '440px' }">

            <div class="flex flex-col gap-4 py-2">
                <div class="flex align-items-start gap-3">
                    <i class="pi pi-exclamation-triangle text-2xl text-orange-500 mt-1"></i>
                    <div class="flex flex-col gap-1">
                        <span class="font-medium">Esta acción desactivará la categoría y todos sus productos activos.</span>
                        <span class="text-sm text-muted-color" *ngIf="options?.mensaje">{{ options?.mensaje }}</span>
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-sm">
                        Escribe <strong>{{ options?.nombre }}</strong> para confirmar:
                    </label>
                    <input
                        pInputText
                        [(ngModel)]="inputValue"
                        [placeholder]="options?.nombre || ''"
                        class="w-full"
                        (keyup.enter)="inputValue === options?.nombre && onAccept()" />
                </div>

                @if (error) {
                    <p-message severity="error" [text]="error" styleClass="w-full" />
                }
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-end gap-2">
                    <p-button
                        label="Cancelar"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="onCancel()" />
                    <p-button
                        label="Sí, eliminar"
                        severity="danger"
                        [disabled]="inputValue !== options?.nombre"
                        [loading]="loading"
                        (onClick)="onAccept()" />
                </div>
            </ng-template>
        </p-dialog>
    `,
})
export class ConfirmInputDialog implements OnInit, OnDestroy {
    private confirmService = inject(ConfirmService);
    private sub = new Subscription();

    visible = false;
    loading = false;
    inputValue = '';
    error: string | null = null;
    options: DeleteWithInputOptions | null = null;

    ngOnInit() {
        this.sub.add(
            this.confirmService.deleteWithInput$.subscribe(opts => {
                if (opts) {
                    this.options = opts;
                    this.inputValue = '';
                    this.error = null;
                    this.loading = false;
                    this.visible = true;
                } else {
                    this.visible = false;
                }
            })
        );
    }

    ngOnDestroy() { this.sub.unsubscribe(); }

    onAccept() {
        if (this.inputValue !== this.options?.nombre) {
            this.error = 'El nombre no coincide.';
            return;
        }
        this.loading = true;
        this.options?.onAccept();
        this.visible = false;
        this.loading = false;
    }

    onCancel() {
        this.options?.onReject?.();
        this.visible = false;
        this.confirmService.closeDeleteWithInput();
    }
}