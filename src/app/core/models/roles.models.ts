export interface Modulo {
  id?: string;
  codigo: string;
  label: string;
  icono: string;
  ruta: string;
}

export interface Permiso {
  id: string;
  codigo: string;
  descripcion: string;
  submodulo: string;
  ruta: string;
  icono: string;
  modulo: Modulo | null;
}

export interface Rol {
  id: string;
  tenant: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: Permiso[];
}

export interface RolPermiso {
  id?: number;
  rol: string;
  permiso: string;
}
export interface RolFormPayload {
  nombre: string;
  descripcion?: string;
  permiso_ids: string[];
}