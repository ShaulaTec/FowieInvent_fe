import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { UsuariosService } from '@/app/core/service/users.service';
import { ConfirmService } from '@/app/core/service/confirm.service';
import { AuthService } from '@/app/core/service/auth.service';
import { Usuario } from '@/app/core/models/users.models';
import { RbacModal } from '../../rbac-modal/rbac-modal';

@Component({
  selector: 'app-urbac-detail',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, TagModule,
    SkeletonModule, MessageModule, DividerModule,
    TableModule, RbacModal,
  ],
  templateUrl: './urbac-detail.html',
  styleUrl: './urbac-detail.scss',
})
export class UrbacDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuariosService = inject(UsuariosService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  authService = inject(AuthService);

  usuario: Usuario | null = null;
  loading = true;
  error: string | null = null;
  modalVisible = false;

  ngOnInit() {
    const state = history.state as { usuario?: Usuario };

    if (state?.usuario) {
      this.usuario = state.usuario;
      this.loading = false;
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) this.loadUsuario(id);
      else { this.error = 'ID no encontrado.'; this.loading = false; }
    }
  }

  loadUsuario(id: string) {
    this.loading = true;
    this.error = null;
    this.usuariosService.getUsuario(id).subscribe({
      next: (u) => { this.usuario = u; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'No se pudo cargar el usuario.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openEdit() { this.modalVisible = true; }
  onModalClosed() { this.modalVisible = false; }
  onModalSaved(usuario: Usuario) { this.usuario = usuario; this.modalVisible = false; }

  onDesactivar() {
    if (!this.usuario) return;
    this.confirmService.delete({
      nombre: this.usuario.email,
      onAccept: () => {
        this.usuariosService.desactivarUsuario(this.usuario!.id).subscribe({
          next: (u) => { this.usuario = u; this.cdr.detectChanges(); },
          error: () => { this.error = 'No se pudo desactivar el usuario.'; },
        });
      },
    });
  }
  // Permisos agrupados por módulo para la tabla
  get permisosAgrupados(): { modulo: string; icono: string; permisos: { descripcion: string; codigo: string }[] }[] {
    if (!this.usuario?.rol?.permisos) return [];
    const map = new Map<string, { icono: string; permisos: { descripcion: string; codigo: string }[] }>();
    for (const p of this.usuario.rol.permisos) {
      const key = p.modulo?.label ?? 'General';
      const icono = p.modulo?.icono ?? 'pi pi-circle';
      if (!map.has(key)) map.set(key, { icono, permisos: [] });
      map.get(key)!.permisos.push({ descripcion: p.descripcion, codigo: p.codigo });
    }
    return Array.from(map.entries()).map(([modulo, val]) => ({ modulo, ...val }));
  }

  goBack() {
    this.router.navigate(['/system/rbac/users']);
  }
}