import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import {
  Role,
  Usuario,
} from '../../../core/models/usuario.model';

import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosList implements OnInit {
  private readonly usuarioService =
    inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);

  search = signal('');
  roleSeleccionado = signal<Role | null>(null);

  loading = signal(false);
  error = signal<string | null>(null);

  readonly roles: {
    value: Role;
    label: string;
  }[] = [
    {
      value: 'ADMIN',
      label: 'Administrador',
    },
    {
      value: 'PROFESIONAL',
      label: 'Profesional',
    },
    {
      value: 'USER',
      label: 'Cliente',
    },
  ];

  displayedColumns: string[] = [
    'id',
    'usuario',
    'correo',
    'telefono',
    'cedula',
    'role',
    'estado',
    'perfilProfesional',
    'fechaRegistro',
    'acciones',
  ];

  usuariosFiltrados = computed(() => {
    const texto = this.search()
      .trim()
      .toLowerCase();

    const role = this.roleSeleccionado();

    return this.usuarios().filter((usuario) => {
      const nombre =
        usuario.nombre?.toLowerCase() ?? '';

      const apellidos =
        usuario.apellidos?.toLowerCase() ?? '';

      const nombreCompleto =
        `${nombre} ${apellidos}`.trim();

      const correo =
        usuario.correo?.toLowerCase() ?? '';

      const telefono =
        usuario.telefono?.toLowerCase() ?? '';

      const cedula =
        usuario.cedula?.toLowerCase() ?? '';

      const rol =
        usuario.role?.toLowerCase() ?? '';

      const tituloProfesional =
        usuario.perfilProfesional
          ?.tituloProfesional
          ?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0 ||
        nombre.includes(texto) ||
        apellidos.includes(texto) ||
        nombreCompleto.includes(texto) ||
        correo.includes(texto) ||
        telefono.includes(texto) ||
        cedula.includes(texto) ||
        rol.includes(texto) ||
        tituloProfesional.includes(texto);

      const coincideRole =
        role === null ||
        usuario.role === role;

      return coincideTexto && coincideRole;
    });
  });

  totalUsuarios = computed(
    () => this.usuariosFiltrados().length,
  );

  totalAdministradores = computed(
    () =>
      this.usuarios().filter(
        (usuario) =>
          usuario.role === 'ADMIN',
      ).length,
  );

  totalProfesionales = computed(
    () =>
      this.usuarios().filter(
        (usuario) =>
          usuario.role === 'PROFESIONAL',
      ).length,
  );

  totalClientes = computed(
    () =>
      this.usuarios().filter(
        (usuario) =>
          usuario.role === 'USER',
      ).length,
  );

  totalActivos = computed(
    () =>
      this.usuarios().filter(
        (usuario) => usuario.estado,
      ).length,
  );

  totalInactivos = computed(
    () =>
      this.usuarios().filter(
        (usuario) => !usuario.estado,
      ).length,
  );

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.listar().subscribe({
      next: (response) => {
        const usuarios =
          this.obtenerLista<Usuario>(
            response.data,
          );

        this.usuarios.set(usuarios);
        this.loading.set(false);

        console.log(
          'Usuarios cargados:',
          usuarios,
        );
      },

      error: (error) => {
        console.error(
          'Error al cargar usuarios:',
          error,
        );

        this.error.set(
          'No se pudieron cargar los usuarios.',
        );

        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.roleSeleccionado.set(null);
  }

  getRoleLabel(role: Role): string {
    const etiquetas: Record<Role, string> = {
      ADMIN: 'Administrador',
      PROFESIONAL: 'Profesional',
      USER: 'Cliente',
    };

    return etiquetas[role];
  }

  getRoleIcon(role: Role): string {
    const iconos: Record<Role, string> = {
      ADMIN: 'admin_panel_settings',
      PROFESIONAL: 'school',
      USER: 'person',
    };

    return iconos[role];
  }

  toggleEstado(usuario: Usuario): void {
    const nuevoEstado = !usuario.estado;

    this.usuarioService
      .cambiarEstado(
        usuario.id,
        {
          estado: nuevoEstado,
        },
      )
      .subscribe({
        next: (response) => {
          const usuarioActualizado =
            response.data;

          this.usuarios.update(
            (usuarios) =>
              usuarios.map((item) =>
                item.id === usuario.id
                  ? {
                      ...item,
                      ...usuarioActualizado,
                    }
                  : item,
              ),
          );

          console.log(
            nuevoEstado
              ? 'Usuario activado'
              : 'Usuario desactivado',
            usuarioActualizado,
          );
        },

        error: (error) => {
          console.error(
            'Error al cambiar el estado:',
            error,
          );

          this.error.set(
            'No se pudo cambiar el estado del usuario.',
          );
        },
      });
  }

  private obtenerLista<T>(
    data:
      | T[]
      | {
          data: T[];
          meta?: unknown;
        }
      | null
      | undefined,
  ): T[] {
    if (Array.isArray(data)) {
      return data;
    }

    if (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      Array.isArray(data.data)
    ) {
      return data.data;
    }

    return [];
  }
}