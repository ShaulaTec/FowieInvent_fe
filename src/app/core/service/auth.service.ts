// src/app/core/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthTokens, AuthUser, AuthResponse, PermisoNav } from '../models/auth.models';
import { NavItem } from '@/app/layout/component/app.nav';

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly ACCESS_KEY = 'fi_access';
    private readonly REFRESH_KEY = 'fi_refresh';
    private readonly USER_KEY = 'fi_user';

    // Signal reactivo — los componentes pueden leer `currentUser()` directamente
    private _currentUser = signal<AuthUser | null>(this.loadUser());
    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => !!this._currentUser());

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    fetchMe(): Observable<AuthUser> {
        return this.http.get<AuthUser>(`${environment.apiUrl}/users/me/`).pipe(
            tap(user => {
                localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                this._currentUser.set(user);
            })
        );
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${environment.apiUrl}/auth/login/`, credentials)
            .pipe(
                tap(res => this.saveSession(res)),
                catchError(err => throwError(() => this.parseError(err))),
            );
    }

    // ── Register ──────────────────────────────────────────────────────────────

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${environment.apiUrl}/auth/register/`, data)
            .pipe(
                tap(res => this.saveSession(res)),
                catchError(err => throwError(() => this.parseError(err))),
            );
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    refreshToken(): Observable<AuthTokens> {
        const refresh = this.getRefreshToken();
        return this.http
            .post<AuthTokens>(`${environment.apiUrl}/auth/refresh/`, { refresh })
            .pipe(
                tap(res => localStorage.setItem(this.ACCESS_KEY, res.access)),
                catchError(err => {
                    this.clearSession();
                    return throwError(() => this.parseError(err));
                }),
            );
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    logout(): void {
        this.clearSession();
        this.router.navigate(['/auth/login']);
    }

    // ── Token helpers ─────────────────────────────────────────────────────────

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_KEY);
    }

    getNavItems(moduloCodigo: string): NavItem[] {
        const user = this._currentUser();
        if (!user?.permisos?.length) return [];
        return this.deduplicarNavItems(
            user.permisos.filter(p => p.modulo?.codigo === moduloCodigo)
        );
    }

    private deduplicarNavItems(permisos: PermisoNav[]): NavItem[] {
        const vistos = new Set<string>();
        const items: NavItem[] = [];
        for (const p of permisos) {
            if (!vistos.has(p.submodulo)) {
                vistos.add(p.submodulo);
                items.push({ label: p.submodulo, icon: p.icono, route: p.ruta });
            }
        }
        return items;
    }

    getModulosRaiz(): NavItem[] {
        const user = this._currentUser();
        if (!user?.permisos?.length) return [];

        const vistos = new Set<string>();
        const items: NavItem[] = [];

        for (const p of user.permisos) {
            if (!p.modulo || vistos.has(p.modulo.codigo)) continue;
            vistos.add(p.modulo.codigo);
            items.push({
                label: p.modulo.label,
                icon: p.modulo.icono,
                route: p.modulo.ruta,
            });
        }
        return items;
    }

    tienePermiso(codigo: string): boolean {
        const user = this._currentUser();
        if (!user) return false;
        if (user.rol === 'Owner') return true;
        return user.permisos?.some(p => p.codigo === codigo) ?? false;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private saveSession(res: AuthResponse): void {
        localStorage.setItem(this.ACCESS_KEY, res.access);
        localStorage.setItem(this.REFRESH_KEY, res.refresh);
        if (res.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
            this._currentUser.set(res.user);
        }
    }

    private clearSession(): void {
        localStorage.removeItem(this.ACCESS_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.USER_KEY);
        this._currentUser.set(null);
    }

    private loadUser(): AuthUser | null {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    private parseError(err: any): string {
        if (err?.error) {
            // SimpleJWT devuelve { detail: '...' } o { field: ['msg'] }
            if (typeof err.error === 'string') return err.error;
            if (err.error.detail) return err.error.detail;
            // Toma el primer mensaje de validación del serializer
            const first = Object.values(err.error)[0];
            if (Array.isArray(first)) return first[0] as string;
        }
        return 'Error de conexión. Intenta de nuevo.';
    }
}