import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APPNAME, MENU_ITEMS } from './app.constants';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'JasperFlow';
  appName = APPNAME;
  itemsMenu = MENU_ITEMS;
  showSidenav = true;

  authservice = inject(AuthService);

  router = inject(Router);
  destroyRef = inject(DestroyRef);

  isAdmin = computed(() => {
    const user = this.authservice.user();
    const roles = user?.roles ? Array.from(user.roles as any) : [];
    return roles.some((role: any) => role.name === 'ADMIN');
  });

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.showSidenav = this.router.url !== '/login';
      });
  }

  logout() {
    this.authservice.logout();
  }
}
