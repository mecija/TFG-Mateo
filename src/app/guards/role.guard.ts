import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { catchError, Observable, of, switchMap } from 'rxjs';
import { RoleAuthService } from '../services/roleAuth.service';
import { AuthService } from '../services/auth.service';
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private roleService: RoleAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.checkStatus().pipe(
      catchError((error) => {
        this.router.navigateByUrl('/login');
        return of(false);
      }),

      switchMap(() => {
        const user = this.authService.user();
        if (!user) return of(false);

        const requiredRole = route.data['role'];
        const hasPermission = this.roleService.isAllowedUserByRole(
          user,
          requiredRole
        );
        if (!hasPermission) {
          this.router.navigateByUrl('/home');
          return of(false);
        }

        return of(true);
      })
    );
  }
}
