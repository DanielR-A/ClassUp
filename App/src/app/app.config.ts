import { 
  ApplicationConfig, 
  inject, 
  provideAppInitializer, 
  provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { AuthService } from './core/services/auth.service';

// AGREGAMOS EL IMPORT
import { provideEnvironmentNgxMask } from 'ngx-mask';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        httpErrorInterceptor,
        httpErrorInterceptor,
      ])
    ),  

        provideAppInitializer(() => {
      const authService =
        inject(AuthService);
      return authService.inicializarSesion();
    }),
    //AGREGAMOS EL PROVAIDER
    provideEnvironmentNgxMask()
  ]
};
