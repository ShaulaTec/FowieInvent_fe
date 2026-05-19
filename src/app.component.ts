import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './app/core/service/auth.service';
import { inject } from '@angular/core';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    authService = inject(AuthService)

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.authService.fetchMe().subscribe();
        }
    }

}
