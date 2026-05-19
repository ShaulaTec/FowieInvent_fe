import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AppNav } from "@/app/layout/component/app.nav";
import { AuthService } from "@/app/core/service/auth.service";
import { inject } from "@angular/core";

@Component({
  selector: "app-rbac",
  imports: [
    CommonModule, RouterModule, AppNav,
  ],
  templateUrl: "./rbac.html",
  styleUrl: "./rbac.scss",
})
export class Rbac {

  authService = inject(AuthService)
  navItems = this.authService.getNavItems('rbac')

}
