import { Component, inject, OnInit, OnDestroy, Injectable, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { Subject, Subscription } from 'rxjs';
import { Producto } from '@/app/core/models/inventory.models';
import { InventoryService } from '@/app/core/service/inventory.service';

export interface ReactivarOptions {
  productos: Producto[];
  onDone: (reactivados: Producto[]) => void;
}

@Injectable({ providedIn: 'root' })
export class ReactivarService {
  private _open$ = new Subject<ReactivarOptions | null>();
  readonly open$ = this._open$.asObservable();
  open(opts: ReactivarOptions) { this._open$.next(opts); }
  close() { this._open$.next(null); }
}

@Component({
  selector: 'app-reactivar-productos-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, CheckboxModule, MessageModule],
  template: `
        <p-dialog
            header="¿Reactivar productos?"
            [visible]="visible"
            (visibleChange)="!$event && onDejar()"
            [modal]="true"
            [draggable]="false"
            [resizable]="false"
            styleClass="w-full"
            [style]="{ maxWidth: '480px' }">

            <div class="flex flex-col gap-4 py-2">
                <span class="text-sm text-muted-color">
                    La categoría fue reactivada. Los siguientes productos estaban inactivos,
                    ¿deseas reactivarlos también?
                </span>

                <div class="flex flex-col gap-2">
                    @for (producto of productos; track producto.id) {
                        <div class="flex align-items-center gap-3 p-2 border-round surface-ground">
                            <p-checkbox
                                [(ngModel)]="seleccionados"
                                [value]="producto.id"
                                [inputId]="producto.id" />
                            <label [for]="producto.id" class="text-sm font-medium cursor-pointer">
                                {{ producto.nombre }}
                                <span class="text-muted-color text-xs ml-1">{{ producto.unidad_medida }}</span>
                            </label>
                        </div>
                    }
                </div>

                @if (error) {
                    <p-message severity="error" [text]="error" styleClass="w-full" />
                }
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-between gap-2">
                    <p-button
                        label="No, dejar inactivos"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="onDejar()"
                        [disabled]="loading" />
                    <p-button
                        label="Sí, activar seleccionados"
                        severity="success"
                        [loading]="loading"
                        [disabled]="seleccionados.length === 0"
                        (onClick)="onActivar()" />
                </div>
            </ng-template>
        </p-dialog>
    `,
})
export class ReactivarProductosDialog implements OnInit, OnDestroy {
  private reactivarService = inject(ReactivarService);
  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef)
  private sub = new Subscription();

  visible = false;
  loading = false;
  error: string | null = null;
  productos: Producto[] = [];
  seleccionados: string[] = [];
  private onDone?: (reactivados: Producto[]) => void;

  ngOnInit() {
    this.sub.add(
      this.reactivarService.open$.subscribe(opts => {
        if (opts) {
          this.productos = opts.productos;
          this.seleccionados = opts.productos.map(p => p.id);
          this.onDone = opts.onDone;
          this.error = null;
          this.loading = false;
          this.visible = true;
        } else {
          this.visible = false;
        }
        this.cdr.detectChanges()
      })
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  onActivar() {
    if (this.seleccionados.length === 0) return;
    this.loading = true;
    this.error = null;

    this.inventoryService.activarProductos(this.seleccionados).subscribe({
      next: () => {
        const reactivados = this.productos
          .filter(p => this.seleccionados.includes(p.id))
          .map(p => ({ ...p, activo: true }));
        this.loading = false;
        this.visible = false;
        this.cdr.detectChanges()
        this.onDone?.(reactivados);
        this.reactivarService.close();
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron reactivar. Intenta de nuevo.';
      },
    });
  }

  onDejar() {
    this.visible = false;
        this.cdr.detectChanges()
    this.onDone?.([]);
    this.reactivarService.close();
  }
}