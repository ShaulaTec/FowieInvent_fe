import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Producto, Categoria } from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryStateService {
    // ── Productos ─────────────────────────────────────────────────────────
    private _openCreateProducto$ = new Subject<void>();
    private _openEditProducto$ = new Subject<Producto>();
    private _deleteProducto$ = new Subject<void>();
    readonly openCreateProducto$ = this._openCreateProducto$.asObservable();
    readonly openEditProducto$ = this._openEditProducto$.asObservable();
    readonly deleteProducto$ = this._deleteProducto$.asObservable();
    triggerCreateProducto() { this._openCreateProducto$.next(); }
    triggerEditProducto(p: Producto) { this._openEditProducto$.next(p); }
    triggerDeleteProducto() { this._deleteProducto$.next(); }

    // ── Categorías ────────────────────────────────────────────────────────
    private _openCreateCategoria$ = new Subject<void>();
    private _openEditCategoria$ = new Subject<Categoria>();
    private _deleteCategoria$ = new Subject<void>();
    readonly openCreateCategoria$ = this._openCreateCategoria$.asObservable();
    readonly openEditCategoria$ = this._openEditCategoria$.asObservable();
    readonly deleteCategoria$ = this._deleteCategoria$.asObservable();
    triggerCreateCategoria() { this._openCreateCategoria$.next(); }
    triggerEditCategoria(c: Categoria) { this._openEditCategoria$.next(c); }
    triggerDeleteCategoria() { this._deleteCategoria$.next(); }

    // ── Movimientos ───────────────────────────────────────────────────────
    private _openMovimiento$ = new Subject<void>();
    readonly openMovimiento$ = this._openMovimiento$.asObservable();
    triggerMovimiento() { this._openMovimiento$.next(); }

    // ── Reportes ──────────────────────────────────────────────────────────
    private _openReporte$ = new Subject<void>();
    readonly openReporte$ = this._openReporte$.asObservable();
    triggerReporte() { this._openReporte$.next(); }
}