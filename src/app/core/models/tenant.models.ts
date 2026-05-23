// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------
export interface Plan {
  id: string;
  nombre: string;
  max_usuarios: number;
  max_productos: number;
  max_categorias: number;
  precio_mensual: string;
  activo: boolean;
}

// ---------------------------------------------------------------------------
// Modulo
// ---------------------------------------------------------------------------
export interface Modulo {
  id: string;
  codigo: string;
  nombre: string;
  label: string;
  descripcion: string;
  icono: string;
  ruta: string;
  precio_mensual: string;
  activo: boolean;
}

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------
export type TenantEstado = 'activo' | 'inactivo' | 'suspendido';

export interface Tenant {
  id: string;
  plan: Plan;
  nombre_negocio: string;
  email_contacto: string;
  estado: TenantEstado;
  fecha_registro: string;       // ISO date: "YYYY-MM-DD"
  fecha_vencimiento: string;    // ISO date: "YYYY-MM-DD"
}

// ---------------------------------------------------------------------------
// TenantModulo
// ---------------------------------------------------------------------------
export interface TenantModulo {
  tenant: string;               // tenant_id (UUID)
  modulo: Modulo;
  fecha_activacion: string;     // ISO date: "YYYY-MM-DD"
  activo: boolean;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------
export interface UpdateTenantDto {
  nombre_negocio?: string;
  email_contacto?: string;
  plan_id?: string;
}