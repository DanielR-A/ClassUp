import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-perfil',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
    private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly usuario = this.authService.usuario;

  /**
   * Obtiene las iniciales del usuario para el avatar.
   */
  readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre?.trim();
    if (!nombre) {
      return 'US';
    }
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  readonly rolDescripcion = computed(() => {
    const role = this.usuario()?.role;
    switch (role) {
      case Role.ADMIN:
        return 'Administrador';
      case Role.USER:
        return 'Cliente';
      default:
        return 'Usuario';
    }
  });

  readonly esAdministrador = computed(
    () => this.usuario()?.role === Role.ADMIN,
  );


  readonly iconoRol = computed(() =>
    this.esAdministrador() ? 'admin_panel_settings' : 'person',
  );

  cerrarSesion(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  regresarAlInicio(): void {
    void this.router.navigate(['/inicio']);
  }
}
