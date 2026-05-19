import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '@/app/core/service/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ButtonModule, TagModule, CheckboxModule, InputTextModule, PasswordModule,
        FormsModule, RouterModule, RippleModule, DividerModule, MessageModule,
        AppFloatingConfigurator
    ],
    template: `
        <app-floating-configurator />

        <div class="auth-shell">

            <!-- IZQUIERDA: Panel decorativo (solo desktop) -->
            <div class="auth-panel hidden md:flex">
                <div>
                    <p-tag value="v0.2 · En desarrollo" severity="success"></p-tag>
                    <h2 class="auth-panel__title">
                        Bienvenido<br/>
                        <span style="opacity:0.7">de vuelta</span><br/>
                        a tu inventario.
                    </h2>
                    <p class="auth-panel__sub">
                        FowieInvent democratiza el control de inventario para pequeños negocios en México.
                    </p>
                </div>

                <div class="flex flex-col gap-4">
                    @for (feature of features; track feature.icon) {
                    <div class="flex align-items-start gap-3">
                        <div class="auth-panel__icon">
                            <i class="pi {{ feature.icon }}" style="color:white; font-size:1.2rem;"></i>
                        </div>
                        <div>
                            <div style="color:white; font-weight:600; margin-bottom:0.25rem;">{{ feature.title }}</div>
                            <div style="color:rgba(255,255,255,0.6); font-size:0.875rem; line-height:1.6;">{{ feature.desc }}</div>
                        </div>
                    </div>
                    }
                </div>

                <div class="flex gap-3">
                    @for (stat of stats; track stat.val) {
                    <div class="auth-panel__stat">
                        <div style="color:white; font-size:1.25rem; font-weight:700;">{{ stat.val }}</div>
                        <div style="color:rgba(255,255,255,0.6); font-size:0.75rem; margin-top:0.25rem;">{{ stat.label }}</div>
                    </div>
                    }
                </div>

                <p style="color:rgba(255,255,255,0.4); font-size:0.75rem; margin:0;">
                    © 2026 ShaulaTec · Morelia, México · Licencia AGPL
                </p>
            </div>

            <!-- DERECHA: Form -->
            <div class="auth-form bg-surface-0 dark:bg-surface-950">

                <a routerLink="/" class="auth-form__brand">
                    <span class="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center">
                        <i class="pi pi-box text-white text-sm"></i>
                    </span>
                    <span class="font-bold text-xl text-900">FowieInvent</span>
                </a>

                <h1 class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-1">Inicia sesión</h1>
                <p class="text-muted-color mt-1 mb-5">Ingresa tus credenciales para continuar.</p>

                <div class="flex flex-col gap-4">

                    @if (error()) {
                    <p-message severity="error" [text]="error()!" styleClass="w-full"></p-message>
                    }

                    <div class="flex flex-col gap-1">
                        <label class="text-surface-900 dark:text-surface-0 font-medium text-sm">Correo electrónico</label>
                        <input pInputText type="email" placeholder="correo@ejemplo.com" class="w-full"
                            [(ngModel)]="email" [disabled]="loading()" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-surface-900 dark:text-surface-0 font-medium text-sm">Contraseña</label>
                        <p-password [(ngModel)]="password" placeholder="Contraseña" [toggleMask]="true"
                            [fluid]="true" [feedback]="false" [disabled]="loading()"></p-password>
                    </div>

                    <div class="flex align-items-center justify-content-between flex-wrap gap-2">
                        <div class="flex align-items-center gap-2">
                            <p-checkbox [(ngModel)]="recordarme" id="recordarme" binary [disabled]="loading()"></p-checkbox>
                            <label for="recordarme" class="text-sm text-muted-color">Recuérdame</label>
                        </div>
                        <a class="text-primary font-medium text-sm cursor-pointer">¿Olvidaste tu contraseña?</a>
                    </div>

                    <p-button
                        label="Iniciar sesión"
                        styleClass="w-full"
                        [loading]="loading()"
                        [disabled]="!email || !password"
                        (onClick)="onLogin()">
                    </p-button>

                    <p-divider></p-divider>

                    <p class="text-center text-muted-color text-sm m-0">
                        ¿No tienes cuenta?
                        <a routerLink="/auth/register" class="text-primary font-medium cursor-pointer ml-1">Regístrate gratis</a>
                    </p>
                </div>
            </div>

        </div>

        <style>
            .auth-shell {
                display: flex;
                width: 100vw;
                min-height: 100vh;
            }
            .auth-panel {
                width: 50%;
                flex-direction: column;
                justify-content: space-between;
                padding: 3rem;
                background: linear-gradient(135deg, var(--p-primary-900) 0%, var(--p-primary-700) 50%, var(--p-primary-500) 100%);
            }
            .auth-panel__title {
                color: white;
                font-size: 2.5rem;
                font-weight: 700;
                line-height: 1.1;
                margin-top: 1.5rem;
                margin-bottom: 1rem;
            }
            .auth-panel__sub {
                color: rgba(255,255,255,0.65);
                font-size: 1.1rem;
                line-height: 1.7;
            }
            .auth-panel__icon {
                width: 3rem; height: 3rem;
                border-radius: 50%;
                background: rgba(255,255,255,0.15);
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .auth-panel__stat {
                flex: 1;
                padding: 1rem;
                border-radius: 0.5rem;
                background: rgba(255,255,255,0.1);
            }
            .auth-form {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 2rem;
            }
            .auth-form__brand {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                text-decoration: none;
                margin-bottom: 2rem;
                cursor: pointer;
            }
            @media (min-width: 768px) {
                .auth-form {
                    padding: 3rem 4rem;
                }
            }
        </style>
    `
})
export class Login {
    email      = '';
    password   = '';
    recordarme = false;

    loading = signal(false);
    error   = signal<string | null>(null);

    features = [
        { icon: 'pi-box',        title: 'Control de inventario en tiempo real', desc: 'Entradas, salidas y alertas de stock bajo con historial completo.' },
        { icon: 'pi-shield',     title: 'RBAC dinámico por tenant',             desc: 'Cada negocio tiene sus propios roles y permisos completamente aislados.' },
        { icon: 'pi-chart-line', title: 'Reportes exportables en PDF',          desc: 'Genera reportes de movimientos y stock en segundos.' },
    ];

    stats = [
        { val: 'AGPL', label: 'Código abierto' },
        { val: '$500', label: 'MXN / mes' },
        { val: '99%',  label: 'SLA mensual' },
    ];

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {}

    onLogin(): void {
        if (!this.email || !this.password) return;
        this.loading.set(true);
        this.error.set(null);
        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: () => this.router.navigate(['/system']),
            error: (msg: string) => { this.error.set(msg); this.loading.set(false); },
        });
    }
}