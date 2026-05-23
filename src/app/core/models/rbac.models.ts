import type { Modulo, Tenant } from './tenant.models';

// ---------------------------------------------------------------------------
// Permiso
// ---------------------------------------------------------------------------
export interface Permiso {
  id: string;
  modulo: Modulo | null;
  codigo: string;               // e.g. "usuarios.crear"
  submodulo: string;
  ruta: string;                 // ruta de frontend, e.g. "/usuarios/nuevo"
  icono: string;
  descripcion: string;
}

// ---------------------------------------------------------------------------
// Rol
// ---------------------------------------------------------------------------
export interface Rol {
  id: string;
  tenant: Tenant;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: Permiso[];
}

// ---------------------------------------------------------------------------
// Usuario
// ---------------------------------------------------------------------------
export interface Usuario {
  id: string;
  tenant: Tenant | null;        // null = superusuario de plataforma
  rol: Rol | null;
  email: string;
  activo: boolean;
  is_staff: boolean;
  ultimo_acceso: string | null; // ISO datetime
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------
export interface CreateUsuarioDto {
  tenant_id: string;
  rol_id: string;
  email: string;
  password: string;
}

export interface UpdateUsuarioDto {
  rol_id?: string;
  email?: string;
  activo?: boolean;
}

export interface CreateRolDto {
  tenant_id: string;
  nombre: string;
  descripcion?: string;
  permiso_ids: string[];
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permiso_ids?: string[];
}