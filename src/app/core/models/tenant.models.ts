export interface Plan {
  id: string;
  nombre: string;
  max_usuarios: number;
  max_productos: number;
  max_categorias: number;
  precio_mensual: string;
  activo: boolean;
}

export interface Modulo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_mensual: string;
  activo: boolean;
}

export interface Tenant {
  id: string;
  plan: Plan;
  nombre_negocio: string;
  email_contacto: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  fecha_registro: string;
  fecha_vencimiento: string;
}

export interface TenantModulo {
  id: number;
  modulo: Modulo;
  tenant: string;
  fecha_activacion: string;
  activo: boolean;
}

export interface UpdateTenantDto {
  nombre_negocio?: string;
  email_contacto?: string;
  plan_id?: string;
}