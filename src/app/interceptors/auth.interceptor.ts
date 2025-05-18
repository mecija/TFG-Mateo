import {
    HttpContextToken,
    type HttpEvent,
    type HttpHandlerFn,
    type HttpRequest,
  } from '@angular/common/http';
  import { inject, Injector } from '@angular/core';
  import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

  export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);
export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {

  const token = inject(Injector).get(AuthService).token();

  if (req.context.get(BYPASS_AUTH) || !token) return next(req);

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
}
