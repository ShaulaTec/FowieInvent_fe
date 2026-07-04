// subscription.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  // Reemplaza con la raíz de tu API real
  private apiUrl = 'http://localhost:8000/api/tenants/info/cancelar-suscripcion/';

  cancelarSuscripcion(motivo?: string): Observable<any> {
    // Tu backend acepta un campo opcional 'motivo' en el request.data
    const body = { motivo: motivo || 'Cancelado desde el panel de usuario' };
    return this.http.post<any>(this.apiUrl, body);
  }
}