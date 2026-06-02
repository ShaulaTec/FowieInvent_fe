import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { UsuariosService } from '@/app/core/service/users.service';
import { ConfirmService } from '@/app/core/service/confirm.service';
import { AuthService } from '@/app/core/service/auth.service';
import { Usuario } from '@/app/core/models/users.models';
import { RbacModal } from '../rbac-modal/rbac-modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rbac-users',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule,
    SkeletonModule, MessageModule, TooltipModule,
    InputTextModule, IconFieldModule, InputIconModule,
    RbacModal,
  ],
  templateUrl: './rbac-users.html',
})
export class RbacUsers implements OnInit {
  authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuarios: Usuario[] = [];
  loading = true;
  error: string | null = null;
  skeletonRows = Array(6);
  modalVisible = false;
  selectedUsuario: Usuario | null = null;

  ngOnInit() { this.loadUsuarios(); }

  loadUsuarios() {
    this.loading = true;
    this.error = null;
    this.usuariosService.getUsuarios().subscribe({
      next: (u) => { this.usuarios = u; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'No se pudieron cargar los usuarios.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreate() { this.selectedUsuario = null; this.modalVisible = true; }
  openEdit(u: Usuario) { this.selectedUsuario = u; this.modalVisible = true; }
  onModalClosed() { this.modalVisible = false; this.selectedUsuario = null; }

  onModalSaved(usuario: Usuario) {
    const idx = this.usuarios.findIndex(u => u.id === usuario.id);
    if (idx >= 0) this.usuarios = [...this.usuarios.slice(0, idx), usuario, ...this.usuarios.slice(idx + 1)];
    else this.usuarios = [usuario, ...this.usuarios];
    this.modalVisible = false;
    this.selectedUsuario = null;
  }

  onDesactivar(usuario: Usuario) {
    this.confirmService.deleteWithInput({
      nombre: usuario.email,
      onAccept: () => {
        this.usuariosService.desactivarUsuario(usuario.id).subscribe({
          next: (u) => { this.usuarios = this.usuarios.map(x => x.id === u.id ? u : x); this.cdr.detectChanges(); },
          error: () => { this.error = 'No se pudo desactivar el usuario.'; },
        });
      },
    });
  }

  openDetail(usuario: Usuario) {
    this.router.navigate(['/system/rbac/users', usuario.id], { state: { usuario } });
  }
}