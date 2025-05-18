import {
  computed,
  effect,
  inject,
  Injectable,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import {
  catchError,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  timer,
} from 'rxjs';

import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { AuthStatus } from './enums/authStatus.enum';
import { AuthResponse } from './interfaces/authResponse.interface';
import { ErrorAuthResponse } from './interfaces/errorAuthResponse.interface';
import { Role, User } from './interfaces/user.interface';
import { BYPASS_AUTH } from '../interceptors/auth.interceptor';
import { AuthControllerService, TokenRequest } from '../api';

const user_token_name = 'jasper-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService  {
  private auth = inject(AuthControllerService);
  authStatus = signal<AuthStatus>(AuthStatus.Checking);
  user = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem(user_token_name));
  roles = signal<Role[]>([]);

  errorVisibility = signal(false);
  errorMessage = signal('');



  login(email: string, password: string): Observable<boolean> {
    return this.auth
      .login({
        email,
        password,
      })
      .pipe(
        map((res) => {
          return this.handleLoginSuccess(res);
        }),

        catchError((error) => {
          return this.handleLoginError(error);
        })
      );
  }

  logout() {
    this.authStatus.set(AuthStatus.NotAuthenticated);
    this.token.set(null);
    this.user.set(null);
    this.roles.set([]);
    localStorage.removeItem(user_token_name);
  }

  private handleLoginSuccess(res: AuthResponse): boolean {   
    this.user.set(res.user);
    this.token.set(res.token);
    this.authStatus.set(AuthStatus.Authenticated);
    this.roles.set(res.user.roles);
    
    localStorage.setItem(user_token_name, res.token);
    
    return true;
  }

  private handleLoginError(res: HttpErrorResponse) {
    console.log(res);
    
    this.errorVisibility.set(true);
    this.errorMessage.set(res.error);
    this.logout();
    
    return of(false);
  }

  checkStatus(): Observable<boolean> {
    this.authStatus.set(AuthStatus.Checking);

    const token = this.token();
    if (!token) {
      this.logout();
      return of(false);
    }

    const tokenRequest: TokenRequest = {
      token: token,
    }

    return this.auth
      .verifyToken(tokenRequest, undefined, undefined, {
        context: new HttpContext().set(BYPASS_AUTH, true),
      })
      .pipe(
        map((res) => {
          return this.handleLoginSuccess(res);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.handleLoginError(error);
        })
      );
  }
}
