import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Servicio } from '../../../core/models/servicio.model';
import { ServicioService } from '../../../core/services/servicio.service';

@Component({
  selector: 'app-servicio-admin-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './servicio-admin-list.html',
  styleUrl: './servicio-admin-list.css',
})
export class ServicioAdminList implements OnInit {
  private readonly servicioService =
    inject(ServicioService);

  servicios = signal<Servicio[]>([]);

  search = signal('');

  loading = signal(false);

  error = signal<string | null>(null);

  // Guarda el ID del servicio que se está actualizando.
  servicioActualizando =
    signal<number | null>(null);

  displayedColumns: string[] = [
  'nombre',
  'categoria',
  'duracion',
  'modalidad',
  'precio',
  'estado',
  'acciones',
  ];

  serviciosFiltrados = computed(() => {
    const texto = this.search()
      .trim()
      .toLowerCase();

    if (!texto) {
      return this.servicios();
    }

    return this.servicios().filter(
      (servicio) => {
        const nombre =
          servicio.nombre
            ?.toLowerCase() ?? '';

        const descripcion =
          servicio.descripcion
            ?.toLowerCase() ?? '';

        const categoria =
          servicio.categoria?.nombre
            ?.toLowerCase() ?? '';

        return (
          nombre.includes(texto) ||
          descripcion.includes(texto) ||
          categoria.includes(texto)
        );
      },
    );
  });

  totalServicios = computed(
    () => this.serviciosFiltrados().length,
  );

  totalActivos = computed(
    () =>
      this.servicios().filter(
        (servicio) => servicio.estado,
      ).length,
  );

  totalInactivos = computed(
    () =>
      this.servicios().filter(
        (servicio) => !servicio.estado,
      ).length,
  );

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.servicioService.listar().subscribe({
      next: (response) => {
        this.servicios.set(response.data);

        this.loading.set(false);

        console.log(
          'Servicios cargados:',
          response.data,
        );
      },

      error: (error) => {
        console.error(
          'Error al cargar servicios:',
          error,
        );

        this.error.set(
          'No se pudo cargar el mantenimiento de servicios.',
        );

        this.loading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.search.set('');
  }

  toggleEstado(servicio: Servicio): void {
    const nuevoEstado = !servicio.estado;

    this.servicioActualizando.set(
      servicio.id,
    );

    this.error.set(null);

    this.servicioService
      .cambiarEstado(
        servicio.id,
        {
          estado: nuevoEstado,
        },
      )
      .subscribe({
        next: (response) => {
          console.log(
            'Estado actualizado:',
            response,
          );

          this.servicios.update(
            (servicios) =>
              servicios.map((item) =>
                item.id === servicio.id
                  ? {
                      ...item,
                      estado: nuevoEstado,
                    }
                  : item,
              ),
          );

          this.servicioActualizando.set(
            null,
          );
        },

        error: (error) => {
          console.error(
            'Error al cambiar el estado:',
            error,
          );

          this.error.set(
            error?.error?.message ??
              'No se pudo cambiar el estado del servicio.',
          );

          this.servicioActualizando.set(
            null,
          );
        },
      });
  }

  estaActualizando(
    servicioId: number,
  ): boolean {
    return (
      this.servicioActualizando() ===
      servicioId
    );
  }
}