export interface Categoria {
    id: string;
    tenant?: string;
    nombre: string;
    activo: boolean;
}

export interface Producto {
    id: string;
    tenant?: string;
    categoria: Categoria;
    categoria_id?: string;
    nombre: string;
    unidad_medida: string;
    stock_actual: number;
    stock_minimo: number;
    activo: boolean;
    imagen?: string | null;
    created_at: string;
}

export interface Movimiento {
    id: string;
    producto: string;
    producto_nombre?: string;
    usuario: string;
    usuario_nombre?: string;
    tipo: 'entrada' | 'salida';
    cantidad: number;
    motivo: string;
    fecha: string;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateCategoriaDto {
    nombre: string;
}

export interface UpdateCategoriaDto {
    nombre?: string;
    activo?: boolean;
}

export interface CreateProductoDto {
    nombre: string;
    categoria_id: string;
    unidad_medida: string;
    stock_actual?: number;
    stock_minimo?: number;
    imagen?: string | null;
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> {
    activo?: boolean;
}

export interface CreateMovimientoDto {
    producto: string;
    tipo: 'entrada' | 'salida';
    cantidad: number;
    motivo?: string;
}

export interface ProductoSinMovimiento {
    id: string;
    nombre: string;
    unidad_medida: string;
    stock_actual: number;
    stock_minimo: number;
    categoria: string | null;
    ultimo_movimiento: string | null;
}

export interface ProductoBajoStock {
    id: string;
    nombre: string;
    unidad_medida: string;
    stock_actual: number;
    stock_minimo: number;
    faltante: number;
    categoria: string | null;
}

export interface ServicioInfo {
    fecha_vencimiento: string;
    dias_restantes: number;
    estado: string;
    plan: string;
    vencido: boolean;
}

export interface ModuloActivo {
    codigo: string;
    nombre: string;
    label: string;
    icono: string;
    ruta: string;
    fecha_activacion: string;
}

export interface DashboardData {
    parametros: { dias: number; fecha_limite: string };
    productos_sin_movimiento: ProductoSinMovimiento[];
    productos_bajo_stock_minimo: ProductoBajoStock[];
    servicio: ServicioInfo;
    modulos_activos: ModuloActivo[];
}