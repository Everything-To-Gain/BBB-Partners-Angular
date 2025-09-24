import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Get the token from the auth service signal
  const token = authService.token();

  // Define endpoints that should NOT include auth headers
  const excludedEndpoints = [
    '/auth/google-callback',
    '/auth/microsoft-callback',
    '/application/submit-form',
    '/visualdata/type-of-business',
  ];

  // Check if the request URL contains any excluded endpoints
  const isExcludedEndpoint = excludedEndpoints.some((endpoint) => req.url.includes(endpoint));

  // If we have a token, request is to our API, and it's not an excluded endpoint
  if (token && !isExcludedEndpoint) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  // If no token, not an API request, or excluded endpoint, proceed without modification
  return next(req);
};
