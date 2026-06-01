import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';
import { RolesService } from '@/app/core/service/roles.service';
import { UsuariosService } from '@/app/core/service/users.service';

@Component({
  selector: 'app-rbac-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, SkeletonModule, MessageModule, ButtonModule],
  templateUrl: './rbac-dashboard.html',
})
export class RbacDashboard implements OnInit {
  private rolesService = inject(RolesService);
  private usuariosService = inject(UsuariosService);

  loading = true;
  error: string | null = null;

  totalRoles = 0;
  totalUsuarios = 0;
  totalPermisos = 0;

  ngOnInit() {
    forkJoin({
      roles: this.rolesService.getRoles(),
      usuarios: this.usuariosService.getUsuarios(),
      permisos: this.rolesService.getPermisos(),
    }).subscribe({
      next: ({ roles, usuarios, permisos }) => {
        this.totalRoles = roles.length;
        this.totalUsuarios = usuarios.length;
        this.totalPermisos = permisos.length;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos.';
        this.loading = false;
      },
    });
  }
}