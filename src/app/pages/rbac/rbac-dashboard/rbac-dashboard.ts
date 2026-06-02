import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RolesService } from '@/app/core/service/roles.service';
import { RbacStats } from '@/app/core/models/roles.models';

@Component({
  selector: 'app-rbac-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonModule, MessageModule, ButtonModule, TableModule, TagModule],
  templateUrl: './rbac-dashboard.html',
})
export class RbacDashboard implements OnInit {
  private rolesService = inject(RolesService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  error: string | null = null;
  stats: RbacStats | null = null;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = true;
    this.stats = null;
    this.error = null;
    this.rolesService.getRbacStats().subscribe({
      next: (s) => { this.stats = s; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'No se pudieron cargar los datos.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}