import {
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/usuario.model';

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private readonly authService = inject(AuthService);

  readonly publicMenu = input<MenuItem[]>([]);
  readonly adminMaintenanceMenu = input<MenuItem[]>([]);
  readonly adminManagementMenu = input<MenuItem[]>([]);
  readonly cartCount = input(0);

  readonly usuario = this.authService.usuario;
  readonly autenticado = this.authService.autenticado;
  readonly cargandoSesion = this.authService.cargandoSesion;
  readonly sesionInicializada = this.authService.sesionInicializada;
  readonly rol = this.authService.rol;
  readonly esAdmin = this.authService.esAdmin;

  readonly nombreRol = computed(() => {
    const rol = this.rol();

    if (rol === Role.ADMIN) {
      return 'Administrador';
    }

    if (rol === Role.PROFESIONAL) {
      return 'Profesional';
    }

    if (rol === Role.USER) {
      return 'Cliente';
    }

    return 'Usuario';
  });

  /*
   * Genera las iniciales utilizadas en el avatar.
   */
  readonly iniciales = computed(() => {
    const usuario = this.usuario();

    if (!usuario) {
      return 'US';
    }

    const nombreCompleto = `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim();

    if (!nombreCompleto) {
      return 'US';
    }

    return nombreCompleto
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  /*
   * Elementos del menú principal permitidos
   * para el usuario actual.
   */
  readonly publicMenuVisible = computed(() =>
    this.publicMenu().filter((item) =>
      this.puedeMostrar(item)
    )
  );

  /*
   * Elementos administrativos de mantenimiento
   * permitidos para el rol actual.
   */
  readonly adminMaintenanceMenuVisible = computed(() =>
    this.adminMaintenanceMenu().filter((item) =>
      this.puedeMostrar(item)
    )
  );

  /*
   * Elementos administrativos de gestión
   * permitidos para el rol actual.
   */
  readonly adminManagementMenuVisible = computed(() =>
    this.adminManagementMenu().filter((item) =>
      this.puedeMostrar(item)
    )
  );

  /*
   * Indica si existe al menos una opción visible
   * en el menú de mantenimientos.
   */
  readonly mostrarMenuMantenimientos = computed(
    () => this.adminMaintenanceMenuVisible().length > 0
  );

  /*
   * Indica si existe al menos una opción visible
   * en el menú de gestión.
   */
  readonly mostrarMenuGestion = computed(
    () => this.adminManagementMenuVisible().length > 0
  );

  /*
   * Sin roles:
   * el elemento es público.
   *
   * Con roles:
   * AuthService verifica si el usuario posee
   * alguno de los roles permitidos.
   */
  puedeMostrar(item: MenuItem): boolean {
    if (!item.roles?.length) {
      return true;
    }

    return this.authService.tieneRol(item.roles);
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}