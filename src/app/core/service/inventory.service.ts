import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Categoria,
    Producto,
    Movimiento,
    CreateProductoDto,
    UpdateProductoDto,
    CreateCategoriaDto,
    UpdateCategoriaDto,
    CreateMovimientoDto,
} from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {

    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ── Categorías ────────────────────────────────────────────────────────────

    getCategorias(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.base}/inventory/categorias/`);
    }

    createCategoria(dto: CreateCategoriaDto): Observable<Categoria> {
        return this.http.post<Categoria>(`${this.base}/inventory/categorias/`, dto);
    }

    updateCategoria(id: string, dto: UpdateCategoriaDto): Observable<Categoria> {
        return this.http.patch<Categoria>(`${this.base}/inventory/categorias/${id}/`, dto);
    }

    deleteCategoria(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/categorias/${id}/`);
    }

    reactivarCategoria(id: string): Observable<{ categoria: Categoria; productos_inactivos: Producto[] }> {
        return this.http.post<{ categoria: Categoria; productos_inactivos: Producto[] }>(
            `${this.base}/inventory/categorias/${id}/reactivar/`,
            {}
        );
    }

    // ── Productos ─────────────────────────────────────────────────────────────

    getProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.base}/inventory/productos/`);
    }

    getProducto(id: string): Observable<Producto> {
        return this.http.get<Producto>(`${this.base}/inventory/productos/${id}/`);
    }

    createProducto(dto: CreateProductoDto): Observable<Producto> {
        return this.http.post<Producto>(`${this.base}/inventory/productos/`, dto);
    }

    updateProducto(id: string, dto: UpdateProductoDto): Observable<Producto> {
        return this.http.patch<Producto>(`${this.base}/inventory/productos/${id}/`, dto);
    }

    deleteProducto(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/productos/${id}/`);
    }

    activarProductos(ids: string[]): Observable<{ activados: number }> {
        return this.http.post<{ activados: number }>(
            `${this.base}/inventory/productos/activar-batch/`,
            { ids }
        );
    }

    reactivarProducto(id: string): Observable<Producto> {
        return this.http.post<Producto>(`${this.base}/inventory/productos/${id}/reactivar/`, {});
    }

    // ── Movimientos ───────────────────────────────────────────────────────────

    getMovimientos(params?: { desde?: string; hasta?: string; producto?: string }): Observable<Movimiento[]> {
        let httpParams = new HttpParams();
        if (params?.desde) httpParams = httpParams.set('desde', params.desde);
        if (params?.hasta) httpParams = httpParams.set('hasta', params.hasta);
        if (params?.producto) httpParams = httpParams.set('producto', params.producto);

        return this.http.get<Movimiento[]>(`${this.base}/inventory/movimientos/`, { params: httpParams });
    }

    getMovimientosByProducto(productoId: string): Observable<Movimiento[]> {
        return this.http.get<Movimiento[]>(
            `${this.base}/inventory/movimientos/?producto=${productoId}`
        );
    }

    createMovimiento(dto: CreateMovimientoDto): Observable<Movimiento> {
        return this.http.post<Movimiento>(`${this.base}/inventory/movimientos/`, dto);
    }


    // ── Reportes ───────────────────────────────────────────────────────────

    descargarReportePDF(params: { desde: string; hasta: string; producto?: string }): Observable<Blob> {
        let httpParams = new HttpParams()
            .set('desde', params.desde)
            .set('hasta', params.hasta);
        if (params.producto) httpParams = httpParams.set('producto', params.producto);

        return this.http.get(`${this.base}/inventory/reportes/movimientos.pdf/`, {
            params: httpParams,
            responseType: 'blob',
        });
    }
}