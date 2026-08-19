// Este interceptor agrega automáticamente el token JWT a todas las peticiones protegidas que realiza Angular hacia el API.
// •
// Antes de enviar una petición, el interceptor consulta el token almacenado en AuthService.
// •
// Evita que cada servicio tenga que agregar manualmente el encabezado de autenticación.
import { inject } from '@angular/core';

import {
    HttpInterceptorFn,
} from '@angular/common/http';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn =
    (request, next) => {
        const authService =
            inject(AuthService);

        const token =
            authService.obtenerToken();

        if (!token) {
            return next(request);
        }

        const requestAutenticado =
            request.clone({
                setHeaders: {
                    Authorization:
                        `Bearer ${token}`,
                },
            });

        return next(requestAutenticado);
    };