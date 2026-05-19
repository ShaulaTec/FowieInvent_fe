import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tenant, TenantModulo, Plan, UpdateTenantDto } from '../models/tenant.models';

@Injectable({ providedIn: 'root' })
export class TenantService {
    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getTenant(): Observable<Tenant[]> {
        return this.http.get<Tenant[]>(`${this.base}/tenants/info/`);
    }

    getModulos(): Observable<TenantModulo[]> {
        return this.http.get<TenantModulo[]>(`${this.base}/tenants/modulos-activos/`);
    }

    getPlanes(): Observable<Plan[]> {
        return this.http.get<Plan[]>(`${this.base}/tenants/planes/`);
    }
}