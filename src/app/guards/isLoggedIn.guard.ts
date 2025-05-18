import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class IsLoggedGuard implements CanActivate {
  authService = inject(AuthService);
  router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.authService.checkStatus().pipe(
      catchError(() => {
        this.router.navigateByUrl('/login');
        return of(false);
      }),
      map((response) => {        
        if (response) return true;

        return false;
      }),
      tap((authorized) => {
        
        if (!authorized) {
          this.router.navigateByUrl('/login');
        }
      })
    );
  }

}
