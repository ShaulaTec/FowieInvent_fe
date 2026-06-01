import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permiso, RbacStats, Rol, RolPermiso } from '../models/roles.models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/roles`;

  getRbacStats(): Observable<RbacStats> {
    return this.http.get<RbacStats>(`${this.base}/stats/`);
  }

  getPermisos(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.base}/permisos/`);
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.base}/roles/`);
  }

  getRol(id: string): Observable<Rol> {
    return this.http.get<Rol>(`${this.base}/roles/${id}/`);
  }

  crearRol(payload: { nombre: string; descripcion?: string }): Observable<Rol> {
    return this.http.post<Rol>(`${this.base}/roles/`, payload);
  }

  actualizarRol(id: string, payload: Partial<Rol>): Observable<Rol> {
    return this.http.patch<Rol>(`${this.base}/roles/${id}/`, payload);
  }

  eliminarRol(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/roles/${id}/`);
  }

  getRolPermisos(): Observable<RolPermiso[]> {
    return this.http.get<RolPermiso[]>(`${this.base}/rol-permisos/`);
  }

  asignarPermiso(rolId: string, permisoId: string): Observable<RolPermiso> {
    return this.http.post<RolPermiso>(`${this.base}/rol-permisos/`, {
      rol: rolId,
      permiso: permisoId,
    });
  }

  revocarPermiso(rolPermisoId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/rol-permisos/${rolPermisoId}/`);
  }


  crearRolConPermisos(
    nombre: string,
    descripcion: string,
    permisoIds: string[]
  ): Observable<RolPermiso[]> {
    return this.crearRol({ nombre, descripcion }).pipe(
      switchMap((rol) =>
        forkJoin(
          permisoIds.map((permisoId) => this.asignarPermiso(rol.id, permisoId))
        )
      )
    );
  }

  reemplazarPermisos(
    rolId: string,
    idsActuales: number[],
    idsNuevos: string[]
  ): Observable<RolPermiso[]> {
    const revocaciones$ = idsActuales.length
      ? forkJoin(idsActuales.map((id) => this.revocarPermiso(id)))
      : forkJoin([new Observable<void>((obs) => { obs.next(); obs.complete(); })]);

    return revocaciones$.pipe(
      switchMap(() =>
        forkJoin(idsNuevos.map((permisoId) => this.asignarPermiso(rolId, permisoId)))
      )
    );
  }
}