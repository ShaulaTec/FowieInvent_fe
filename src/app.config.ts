// src/app/app.config.ts
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { appRoutes } from './app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { planLimitInterceptor } from './app/core/interceptors/plan-limit.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        ConfirmationService,
        MessageService,   // ← singleton global para toasts

        provideRouter(
            appRoutes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
            withEnabledBlockingInitialNavigation(),
        ),

        provideHttpClient(
            withFetch(),
            withInterceptors([
                authInterceptor,     
                planLimitInterceptor,
            ]),
        ),

        provideZonelessChangeDetection(),

        providePrimeNG({
            theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
        }),
    ],
};