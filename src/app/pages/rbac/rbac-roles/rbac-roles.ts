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
import { RolesService } from '@/app/core/service/roles.service';
import { ConfirmService } from '@/app/core/service/confirm.service';
import { AuthService } from '@/app/core/service/auth.service';
import { Rol } from '@/app/core/models/roles.models';
import { RbacModal } from '../rbac-modal/rbac-modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rbac-roles',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule,
    SkeletonModule, MessageModule, TooltipModule,
    InputTextModule, IconFieldModule, InputIconModule,
    RbacModal,
  ],
  templateUrl: './rbac-roles.html',
})
export class RbacRoles implements OnInit {
  authService = inject(AuthService);
  private rolesService = inject(RolesService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  roles: Rol[] = [];
  loading = true;
  error: string | null = null;
  skeletonRows = Array(6);
  modalVisible = false;
  selectedRol: Rol | null = null;

  ngOnInit() { this.loadRoles(); }

  loadRoles() {
    this.loading = true;
    this.error = null;
    this.rolesService.getRoles().subscribe({
      next: (roles) => { this.roles = roles; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'No se pudieron cargar los roles.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreate() { this.selectedRol = null; this.modalVisible = true; }
  openEdit(rol: Rol) { this.selectedRol = rol; this.modalVisible = true; }
  onModalClosed() { this.modalVisible = false; this.selectedRol = null; }

  onModalSaved(rol: Rol) {
    const idx = this.roles.findIndex(r => r.id === rol.id);
    if (idx >= 0) this.roles = [...this.roles.slice(0, idx), rol, ...this.roles.slice(idx + 1)];
    else this.roles = [rol, ...this.roles];
    this.modalVisible = false;
    this.selectedRol = null;
  }

  onDelete(rol: Rol) {
    this.confirmService.deleteWithInput({
      nombre: rol.nombre,
      onAccept: () => {
        this.rolesService.eliminarRol(rol.id).subscribe({
          next: () => { this.roles = this.roles.filter(r => r.id !== rol.id); this.cdr.detectChanges(); },
          error: () => { this.error = 'No se pudo eliminar el rol.'; },
        });
      },
    });
  }

  openDetail(rol: Rol) {
    this.router.navigate(['/system/rbac/roles', rol.id], { state: { rol } });
  }

  esOwner(rol: Rol): boolean {
    return rol.nombre === 'Owner';
  }
}