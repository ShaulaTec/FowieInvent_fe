import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppNav } from '@/app/layout/component/app.nav';
import { AuthService } from '@/app/core/service/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterModule, AppNav],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.scss']
})
export class Inventory {

  authService = inject(AuthService)
  navItems = this.authService.getNavItems('inventory');
}