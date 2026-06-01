import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioCreate, UsuarioUpdate, UsuarioMe } from '../models/users.models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/users`;

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}/usuarios/`);
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/usuarios/${id}/`);
  }

  crearUsuario(payload: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/usuarios/`, payload);
  }

  actualizarUsuario(id: string, payload: UsuarioUpdate): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.base}/usuarios/${id}/`, payload);
  }

  desactivarUsuario(id: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.base}/usuarios/${id}/`, { activo: false });
  }

  getMe(): Observable<UsuarioMe> {
    return this.http.get<UsuarioMe>(`${environment.apiUrl}/api/auth/me/`);
  }
}