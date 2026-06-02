import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { RolesService } from '@/app/core/service/roles.service';
import { UsuariosService } from '@/app/core/service/users.service';
import { AuthService } from '@/app/core/service/auth.service';
import { Rol, Permiso } from '@/app/core/models/roles.models';
import { Usuario, UsuarioCreate } from '@/app/core/models/users.models';

export type RbacModalMode = 'rol' | 'usuario';

@Component({
  selector: 'app-rbac-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DialogModule, ButtonModule,
    InputTextModule, TextareaModule, SelectModule, MessageModule, CheckboxModule,
  ],
  templateUrl: './rbac-modal.html',
})
export class RbacModal implements OnChanges {
  @Input() visible = false;
  @Input() mode: RbacModalMode = 'rol';
  @Input() rol: Rol | null = null;
  @Input() usuario: Usuario | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() savedRol = new EventEmitter<Rol>();
  @Output() savedUsuario = new EventEmitter<Usuario>();

  private rolesService = inject(RolesService);
  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  saving = false;
  error: string | null = null;

  rolNombre = '';
  rolDescripcion = '';
  todosPermisos: Permiso[] = [];
  permisosSeleccionados: string[] = [];

  usuarioEmail = '';
  usuarioPassword = '';
  usuarioRolId = '';
  rolesDisponibles: Rol[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true) {
      this.error = null;
      this.saving = false;
      this.initForm();
      this.cdr.detectChanges();
    }
  }

  get esOwner(): boolean {
    return this.rol?.nombre === 'Owner';
  }

  get esMiPropioOwner(): boolean {
    const me = this.authService.currentUser(); // <-- con ()
    return (
      !!this.usuario &&
      !!me &&
      this.usuario.id === me.id &&
      this.usuario.rol?.nombre === 'Owner'
    );
  }

  private initForm() {
    if (this.mode === 'rol') {
      this.rolNombre = this.rol?.nombre ?? '';
      this.rolDescripcion = this.rol?.descripcion ?? '';
      this.permisosSeleccionados = this.rol?.permisos.map(p => p.id) ?? [];
      this.rolesService.getPermisos().subscribe(p => { this.todosPermisos = p; this.cdr.detectChanges(); });
    }

    if (this.mode === 'usuario') {
      this.usuarioEmail = this.usuario?.email ?? '';
      this.usuarioPassword = '';
      this.usuarioRolId = this.usuario?.rol?.id ?? '';
      this.rolesService.getRoles().subscribe(r => { this.rolesDisponibles = r; this.cdr.detectChanges(); });
    }
  }

  get permisosAgrupados(): { modulo: string; permisos: Permiso[] }[] {
    const map = new Map<string, Permiso[]>();
    for (const p of this.todosPermisos) {
      const key = p.modulo?.label ?? 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).map(([modulo, permisos]) => ({ modulo, permisos }));
  }

  togglePermiso(id: string) {
    const idx = this.permisosSeleccionados.indexOf(id);
    if (idx >= 0) this.permisosSeleccionados.splice(idx, 1);
    else this.permisosSeleccionados.push(id);
  }

  tienePermiso(id: string) {
    return this.permisosSeleccionados.includes(id);
  }

  submit() {
    this.error = null;
    this.saving = true;
    this.cdr.detectChanges(); // fuerza render del estado saving antes del async
    this.mode === 'rol' ? this.submitRol() : this.submitUsuario();
  }

  private submitRol() {
    if (!this.rolNombre.trim()) {
      this.error = 'El nombre del rol es obligatorio.';
      this.saving = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.rol) {
      const rolPermisoActuales = this.rol.permisos.map(p => p.id);
      const agregar = this.permisosSeleccionados.filter(id => !rolPermisoActuales.includes(id));

      this.rolesService.actualizarRol(this.rol.id, {
        nombre: this.rolNombre,
        descripcion: this.rolDescripcion,
      }).subscribe({
        next: (rolActualizado) => {
          // Aplicar diff de permisos si hay cambios
          if (agregar.length) {
            agregar.forEach(id => this.rolesService.asignarPermiso(this.rol!.id, id).subscribe());
          }
          this.saving = false;
          this.savedRol.emit(rolActualizado);
          this.closed.emit();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.detail ?? 'Error al actualizar el rol.';
          this.saving = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.rolesService.crearRolConPermisos(
        this.rolNombre,
        this.rolDescripcion,
        this.permisosSeleccionados,
      ).subscribe({
        next: () => {
          this.rolesService.getRoles().subscribe(roles => {
            const nuevo = roles.find(r => r.nombre === this.rolNombre) ?? null;
            if (nuevo) this.savedRol.emit(nuevo);
            this.saving = false;
            this.closed.emit();
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.error = err.error?.detail ?? 'Error al crear el rol.';
          this.saving = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  private submitUsuario() {
    if (!this.usuarioEmail.trim() || !this.usuarioRolId) {
      this.error = 'Email y rol son obligatorios.';
      this.saving = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.usuario) {
      this.usuariosService.actualizarUsuario(this.usuario.id, {
        email: this.usuarioEmail,
        rol_id: this.usuarioRolId,
      }).subscribe({
        next: (u) => { this.savedUsuario.emit(u); this.saving = false; this.closed.emit(); this.cdr.detectChanges(); },
        error: (err) => { this.error = err.error?.detail ?? 'Error al actualizar.'; this.saving = false; this.cdr.detectChanges(); },
      });
    } else {
      if (!this.usuarioPassword || this.usuarioPassword.length < 8) {
        this.error = 'La contraseña debe tener al menos 8 caracteres.';
        this.saving = false;
        this.cdr.detectChanges();
        return;
      }
      const payload: UsuarioCreate = {
        email: this.usuarioEmail,
        password: this.usuarioPassword,
        rol_id: this.usuarioRolId,
      };
      this.usuariosService.crearUsuario(payload).subscribe({
        next: (u) => { this.savedUsuario.emit(u); this.saving = false; this.closed.emit(); this.cdr.detectChanges(); },
        error: (err) => { this.error = err.error?.detail ?? 'Error al crear usuario.'; this.saving = false; this.cdr.detectChanges(); },
      });
    }
  }

  close() { this.closed.emit(); }
}