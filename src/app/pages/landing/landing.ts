import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    AvatarModule,
    DividerModule,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit, AfterViewInit {

  constructor(private router: Router) { }

  // ── SIEMPRE LIGHT EN LA LANDING ──────────────────────────────────
  ngOnInit(): void {
    document.documentElement.classList.remove('app-dark', 'p-dark');
  }

  heroStats = [
    { val: 'Multi-tenant', label: 'Aislamiento total por cuenta' },
    { val: 'AGPL', label: 'Código abierto' },
    { val: '$500 MXN', label: 'Plan básico / mes' },
    { val: 'ERP-ready', label: 'Arquitectura modular' },
  ];

  problemas = [
    {
      num: '01', icon: 'pi pi-list', title: 'Sin trazabilidad',
      desc: '¿Quién movió qué, cuándo y cuánto? En papel nunca lo sabrás. En Excel, tampoco.'
    },

    {
      num: '02', icon: 'pi pi-dollar', title: 'Software caro',
      desc: 'Las soluciones existentes cobran lo que un pequeño negocio no puede pagar.'
    },

    {
      num: '03', icon: 'pi pi-lock', title: 'Sin control de acceso',
      desc: 'Cualquiera puede modificar cualquier cosa. Sin roles, sin historial, sin cuentas.'
    },

    {
      num: '04', icon: 'pi pi-chart-line', title: 'Decisiones a ciegas',
      desc: 'Sin datos en tiempo real sobre stock bajo, las pérdidas son invisibles hasta que es tarde.'
    },
  ];

  modules = [
    {
      num: '01', active: true, status: 'En desarrollo',
      title: 'Inventario',
      desc: 'Control de productos, movimientos, categorías y stock. El núcleo de todo.',
      features: ['Entradas y salidas con historial', 'Alertas de stock bajo', 'RBAC dinámico por tenant', 'Reportes exportables en PDF', 'Dashboard operativo'],
    },
    {
      num: '02', active: false, status: 'Planificado',
      title: 'Punto de venta',
      desc: 'Registra ventas y descuenta stock automáticamente del módulo de inventario.',
      features: ['Integración nativa con Inventario', 'Operable de forma independiente', 'Registro de ventas por empleado'],
    },
    {
      num: '03', active: false, status: 'Planificado',
      title: 'Personal',
      desc: 'Gestión de empleados. Todos los movimientos quedan ligados a quien los hizo.',
      features: ['Trazabilidad por empleado', 'Operable sin otros módulos', 'Base para ERP completo'],
    },
  ];

  plans = [
    {
      name: 'Básico', price: '$500', currency: 'MXN/mes',
      desc: 'Para arrancar sin complicaciones.',
      featured: false,
      features: ['1 usuario', '100 productos', '10 categorías', 'Módulo Inventario', '1 rol administrador', 'Soporte por correo'],
      cta: 'Empezar', ctaStyle: 'ghost',
    },
    {
      name: 'Esencial', price: 'Por definir', currency: '',
      desc: 'El favorito para negocios en crecimiento.',
      featured: true,
      features: ['3 usuarios', '500 productos', '25 categorías', 'Módulo Inventario', 'Roles personalizados (RBAC)', 'Notificaciones avanzadas'],
      cta: 'Solicitar acceso', ctaStyle: 'primary',
    },
    {
      name: 'Pro', price: 'Por definir', currency: '',
      desc: 'Sin límites, para operaciones serias.',
      featured: false,
      features: ['Usuarios ilimitados', 'Productos ilimitados', 'Todos los módulos', 'RBAC multi-módulo', 'Soporte prioritario', 'Respaldos diarios'],
      cta: 'Contactar', ctaStyle: 'ghost',
    },
  ];

  team = [
    {
      initials: 'IY',
      name: 'Ivo Yaluk Ramos Alanís',
      role: 'Frontend · Full-stack',
      bio: 'Ing. en TI y Desarrollo Multiplataforma por la UTM. Ciclo completo: Django, Angular, PostgreSQL y reportes. Sistemas reales en producción.',
      skills: ['Angular', 'TypeScript', 'Python', 'Django', 'PostgreSQL'],
      projects: [
        { name: 'Sistema IRyA — Inventario', where: 'UNAM' },
        { name: 'SIDEC — Frontend', where: 'Contraloría Morelia' },
        { name: 'FowieInvent', where: 'ShaulaTec' },
      ],
      github: 'https://github.com/YalukR',
      githubHandle: 'YalukR',
      email: 'yalukramos@gmail.com',
    },
    {
      initials: 'AT',
      name: 'Alejandra Tinoco Arredondo',
      role: 'Backend · DevOps',
      bio: 'Ing. en Desarrollo Multiplataforma por la UTM. Backend institucional para la Contraloría Municipal de Morelia. Ubuntu Server, Golang.',
      skills: ['Golang', 'Java', 'Spring Boot', 'PostgreSQL', 'Ubuntu Server'],
      projects: [
        { name: 'SIDEc — Backend (Golang)', where: 'Contraloría Morelia' },
        { name: 'Pladiermo — Backend', where: 'Contraloría Morelia' },
        { name: 'FowieInvent', where: 'ShaulaTec' },
      ],
      github: 'https://github.com/AlejandraArredondo26',
      githubHandle: 'AlejandraArredondo26',
      email: 'alejandratinocoarredondo26@gmail.com',
    },
    {
      initials: 'CP',
      name: 'Carina Ponce Osornio',
      role: 'Backend · Full-stack',
      bio: 'Ing. en TI por la UTM. Experiencia en desarrollo web y automatización de procesos: Django, Laravel, React y workflows con n8n. Ha trabajado en sistemas reales de captación de clientes, lead scoring y módulos interactivos con integración a CRM.',
      skills: ['Django', 'Laravel', 'React', 'JavaScript', 'PHP', 'MySQL', 'MongoDB', 'n8n'],
      projects: [
        { name: 'Sistema de automatización y captación de clientes', where: 'CEEC Morelia' },
        { name: 'Módulo de lealtad (React + Firebase)', where: 'Poliforum Morelia' },
        { name: 'FowieInvent', where: 'ShaulaTec' },
      ],
      github: 'https://github.com/valicapa',
      githubHandle: 'Valicapa',
      email: 'crinaponce02@gmail.com',
    }
  ];

  techStack = [
    { label: 'Backend', val: 'Python · Django' },
    { label: 'Frontend', val: 'Angular · PrimeNG · Sakai' },
    { label: 'Arquitectura', val: 'Multi-tenant · Modular' },
    { label: 'Auth', val: 'JWT · RBAC dinámico' },
    { label: 'Seguridad', val: 'bcrypt · CSRF · XSS hardened' },
    { label: 'Base de datos', val: 'PostgreSQL · MySQL' },
    { label: 'Licencia', val: 'AGPL · Código abierto' },
    { label: 'Disponibilidad', val: '99% SLA mensual' },
  ];

  onRequestAccess(): void {
    this.router.navigate(['/auth/register']);
  }

  onLogin(): void {
    this.router.navigate(['/auth/login'])
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const io = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        }),
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      );
      document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
    }, 80);
  }
}