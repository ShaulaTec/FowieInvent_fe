import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notificacion {
  id: string;
  tipo: string;
  modulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private http = inject(HttpClient);

  private api = 'http://localhost:8000/api/notifications/notificaciones/';

  getNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.api);
  }

}