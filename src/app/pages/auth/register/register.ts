import { Component, signal, ViewChild, ElementRef } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { AuthService } from '@/app/core/service/auth.service';
import { Plan } from '@/app/core/models/tenant.models';
import { TenantService } from '@/app/core/service/tenant.service';
import { StripeService } from '@/app/core/service/stripe.service';

@Component({
  selector: "app-register",
  imports: [
    ButtonModule, TagModule, CheckboxModule, InputTextModule, PasswordModule,
    FormsModule, RouterModule, RippleModule, DividerModule, MessageModule,
    AppFloatingConfigurator, SkeletonModule, SelectModule
  ],
  templateUrl: "./register.html",
  styleUrl: "./register.scss",
})
export class Register {

  @ViewChild('cardElement') cardElementRef?: ElementRef<HTMLDivElement>;

  nombre = '';
  apellido = '';
  email = '';
  negocio = '';
  password = '';
  confirmPassword = '';
  planes: Plan[] = [];
  planSeleccionado: string | null = null;
  loadingPlanes = signal(false);
  aceptaTerminos = false;

  loading = signal(false);
  error = signal<string | null>(null);
  passwordMismatch = signal(false);
  stripeError = signal<string | null>(null);
  stripeLoading = signal(false);
  requierePago = signal(false);
  private stripeInitialized = false;

  features = [
    { icon: 'pi-box', title: 'Control de inventario en tiempo real', desc: 'Entradas, salidas y alertas de stock bajo con historial completo.' },
    { icon: 'pi-shield', title: 'RBAC dinámico por tenant', desc: 'Cada negocio tiene sus propios roles y permisos completamente aislados.' },
    { icon: 'pi-chart-line', title: 'Reportes exportables en PDF', desc: 'Genera reportes de movimientos y stock en segundos.' },
  ];

  stats = [
    { val: 'AGPL', label: 'Código abierto' },
    { val: '$500', label: 'MXN / mes' },
    { val: '99%', label: 'SLA mensual' },
  ];

  constructor(
    private authService: AuthService,
    private tenantService: TenantService,
    private stripeService: StripeService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadingPlanes.set(true);
    this.tenantService.getPlanes().subscribe({
      next: planes => {
        this.planes = planes;
        this.loadingPlanes.set(false);
      },
      error: () => this.loadingPlanes.set(false)
    });
  }

  @ViewChild('cardNumberElement') cardNumberRef?: ElementRef<HTMLDivElement>;
  @ViewChild('cardExpiryElement') cardExpiryRef?: ElementRef<HTMLDivElement>;
  @ViewChild('cardCvcElement') cardCvcRef?: ElementRef<HTMLDivElement>;

  async onPlanChange() {
    this.stripeError.set(null);
    const plan = this.planes.find(p => p.id === this.planSeleccionado);
    const necesitaPago = !!plan?.requiere_pago;
    this.requierePago.set(necesitaPago);

    if (!necesitaPago) return;

    this.stripeLoading.set(true);

    setTimeout(async () => {
      try {
        if (!this.stripeInitialized) {
          await this.stripeService.init();
          this.stripeInitialized = true;
        }
        if (this.cardNumberRef && this.cardExpiryRef && this.cardCvcRef) {
          this.stripeService.mountSplitCardElements(
            this.cardNumberRef.nativeElement,
            this.cardExpiryRef.nativeElement,
            this.cardCvcRef.nativeElement,
            { onChange: (event: any) => this.stripeError.set(event.error?.message ?? null) }
          );
        }
      } catch {
        this.stripeError.set('No se pudo cargar el formulario de pago.');
      } finally {
        this.stripeLoading.set(false);
      }
    }, 0);
  }

  canSubmit() {
    return this.aceptaTerminos &&
      !!this.nombre && !!this.apellido &&
      !!this.email && !!this.negocio &&
      !!this.password && !!this.planSeleccionado &&
      !this.loading();
  }

  async onRegister(): Promise<void> {
    this.passwordMismatch.set(false);
    this.error.set(null);
    this.stripeError.set(null);

    if (this.password !== this.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }

    this.loading.set(true);

    let paymentMethodId: string | undefined;
    if (this.requierePago()) {
      try {
        paymentMethodId = await this.stripeService.createPaymentMethod();
      } catch (err: any) {
        this.stripeError.set(err.message ?? 'Error al procesar la tarjeta.');
        this.loading.set(false);
        return;
      }
    }

    this.authService.register({
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.password,
      nombre_negocio: this.negocio,
      plan_id: this.planSeleccionado!,
      payment_method_id: paymentMethodId,
    }).subscribe({
      next: () => this.router.navigate(['/system']),
      error: (msg: string) => { this.error.set(msg); this.loading.set(false); },
    });
  }

}