import { Rol } from "./roles.models";

export interface Usuario {
  id: string;
  email: string;
  tenant: string;
  rol: Rol | null;
  activo: boolean;
  ultimo_acceso: string | null;
}

export interface UsuarioCreate {
  email: string;
  password: string;
  rol_id: string;
}

export interface UsuarioUpdate {
  email?: string;
  rol_id?: string;
  activo?: boolean;
}

export interface UsuarioMe {
  id: string;
  email: string;
  tenant: string;
  rol: string;
  permisos: PermisoMe[];
}

export interface PermisoMe {
  codigo: string;
  submodulo: string;
  ruta: string;
  icono: string;
  modulo: ModuloMe | null;
}

export interface ModuloMe {
  codigo: string;
  label: string;
  icono: string;
  ruta: string;
}