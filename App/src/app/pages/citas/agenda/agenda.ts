import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import {
  Cita,
  EstadoCita,
} from '../../../core/models/cita.model';

import {
  Role,
} from '../../../core/models/usuario.model';

import { CitaService } from '../../../core/services/cita.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda implements OnInit {

  private readonly citaService =
    inject(CitaService);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  citas = signal<Cita[]>([]);

  loading = signal(false);

  error = signal<string | null>(null);

  estadoSeleccionado =
    signal<EstadoCita | null>(null);

  profesionalSeleccionado =
    signal<number | null>(null);

  profesionalesDisponibles = computed(() => {
    const mapa = new Map<
      number,
      string
    >();

    for (const cita of this.citas()) {
      const profesional =
        cita.profesional;

      if (!profesional) {
        continue;
      }

      const nombre =
        `${profesional.usuario?.nombre ?? ''} ${profesional.usuario?.apellidos ?? ''}`
          .trim();

      mapa.set(
        profesional.id,
        nombre || `Profesional ${profesional.id}`,
      );
    }

    return Array.from(
      mapa.entries(),
    ).map(
      ([id, nombre]) => ({
        id,
        nombre,
      }),
    );
  });


  /*
   * Fecha utilizada como referencia
   * para construir la semana visible.
   */
  fechaReferencia =
    signal<Date>(new Date());

  readonly rol =
    this.authService.rol;

  readonly esAdmin =
    this.authService.esAdmin;

  readonly estados: {
    value: EstadoCita;
    label: string;
  }[] = [
      {
        value: 'PENDIENTE',
        label: 'Pendiente',
      },
      {
        value: 'ACEPTADA',
        label: 'Aceptada',
      },
      {
        value: 'RECHAZADA',
        label: 'Rechazada',
      },
      {
        value: 'CANCELADA',
        label: 'Cancelada',
      },
      {
        value: 'COMPLETADA',
        label: 'Completada',
      },
    ];

  /*
   * Primer día de la semana visible.
   * Se usa lunes como inicio.
   */
  inicioSemana = computed(() => {
    const fecha =
      new Date(
        this.fechaReferencia(),
      );

    const dia = fecha.getDay();

    const diferencia =
      dia === 0
        ? -6
        : 1 - dia;

    fecha.setDate(
      fecha.getDate() +
      diferencia,
    );

    fecha.setHours(
      0,
      0,
      0,
      0,
    );

    return fecha;
  });

  finSemana = computed(() => {
    const fecha =
      new Date(
        this.inicioSemana(),
      );

    fecha.setDate(
      fecha.getDate() + 6,
    );

    fecha.setHours(
      23,
      59,
      59,
      999,
    );

    return fecha;
  });

  /*
   * Los siete días que se muestran
   * en la agenda semanal.
   */
  diasSemana = computed(() => {
    const inicio =
      this.inicioSemana();

    return Array.from(
      { length: 7 },
      (_, index) => {
        const fecha =
          new Date(inicio);

        fecha.setDate(
          inicio.getDate() +
          index,
        );

        return fecha;
      },
    );
  });

  /*
   * Horario mostrado en la agenda.
   * Puedes modificarlo después.
   */
  readonly horas = Array.from(
    { length: 13 },
    (_, index) => index + 7,
  );

  /*
   * Primero filtra por estado.
   * El período se resuelve al buscar
   * las citas de cada día.
   */
  citasFiltradas = computed(() => {
    const estado =
      this.estadoSeleccionado();

    const profesionalId =
      this.profesionalSeleccionado();

    return this.citas().filter(
      (cita) => {

        const coincideEstado =
          !estado ||
          cita.estado === estado;

        const coincideProfesional =
          !profesionalId ||
          cita.profesionalId ===
          profesionalId;

        return (
          coincideEstado &&
          coincideProfesional
        );
      },
    );
  });

  ngOnInit(): void {
    this.loadAgenda();
  }







  loadAgenda(): void {
    this.loading.set(true);
    this.error.set(null);

    const rol = this.rol();

    let request;

    if (rol === Role.PROFESIONAL) {
      request =
        this.citaService
          .misSolicitudes();

    } else if (rol === Role.USER) {
      request =
        this.citaService
          .misCitasCliente();

    } else if (rol === Role.ADMIN) {
      request =
        this.citaService
          .listar();

    } else {
      this.error.set(
        'No se pudo determinar el rol del usuario.',
      );

      this.loading.set(false);

      return;
    }

    request.subscribe({
      next: (response: any) => {
        const data =
          response?.data;

        /*
         * Caso:
         * {
         *   success: true,
         *   data: [...]
         * }
         */
        if (Array.isArray(data)) {
          this.citas.set(
            data,
          );

          /*
           * Caso paginado:
           * {
           *   success: true,
           *   data: {
           *      meta: {...},
           *      data: [...]
           *   }
           * }
           */
        } else if (
          data &&
          Array.isArray(data.data)
        ) {
          this.citas.set(
            data.data,
          );

        } else {
          this.citas.set([]);
        }

        this.loading.set(false);
      },

      error: (error: any) => {
        console.error(
          'Error cargando agenda:',
          error,
        );

        this.error.set(
          error?.error?.message ??
          'No se pudo cargar la agenda.',
        );

        this.loading.set(false);
      },
    });
  }




  semanaAnterior(): void {
    const fecha =
      new Date(
        this.fechaReferencia(),
      );

    fecha.setDate(
      fecha.getDate() - 7,
    );

    this.fechaReferencia.set(
      fecha,
    );
  }

  semanaSiguiente(): void {
    const fecha =
      new Date(
        this.fechaReferencia(),
      );

    fecha.setDate(
      fecha.getDate() + 7,
    );

    this.fechaReferencia.set(
      fecha,
    );
  }

  irHoy(): void {
    this.fechaReferencia.set(
      new Date(),
    );
  }

  limpiarFiltros(): void {
    this.estadoSeleccionado.set(
      null,
    );

    this.profesionalSeleccionado.set(
      null,
    );
  }

  /*
   * Devuelve las citas de un día
   * específico.
   */
  getCitasDia(
    fecha: Date,
  ): Cita[] {
    return this.citasFiltradas()
      .filter((cita) =>
        this.mismaFecha(
          cita.fechaCita,
          fecha,
        )
      )
      .sort(
        (a, b) =>
          new Date(
            a.horaInicio,
          ).getTime() -
          new Date(
            b.horaInicio,
          ).getTime(),
      );
  }

  /*
   * Devuelve las citas correspondientes
   * a una hora concreta de un día.
   */
  getCitasHora(
    fecha: Date,
    hora: number,
  ): Cita[] {
    return this.getCitasDia(
      fecha,
    ).filter((cita) => {
      const inicio =
        new Date(
          cita.horaInicio,
        );

      return (
        inicio.getHours() ===
        hora
      );
    });
  }

  tieneCitas(
    fecha: Date,
    hora: number,
  ): boolean {
    return (
      this.getCitasHora(
        fecha,
        hora,
      ).length > 0
    );
  }

  abrirDetalle(
    cita: Cita,
  ): void {
    const rol =
      this.rol();

    if (rol === Role.PROFESIONAL) {
      void this.router.navigate([
        '/profesional/solicitudes',
        cita.id,
      ]);

      return;
    }

    if (rol === Role.USER) {
      void this.router.navigate([
        '/mis-citas',
        cita.id,
      ]);

      return;
    }

    if (rol === Role.ADMIN) {
      void this.router.navigate([
        '/admin/citas',
        cita.id,
      ]);
    }
  }

  getEstadoLabel(
    estado: EstadoCita,
  ): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';

      case 'ACEPTADA':
        return 'Aceptada';

      case 'RECHAZADA':
        return 'Rechazada';

      case 'CANCELADA':
        return 'Cancelada';

      case 'COMPLETADA':
        return 'Completada';
    }
  }

  getNombreCliente(
    cita: Cita,
  ): string {
    const nombre =
      cita.cliente?.nombre ?? '';

    const apellidos =
      cita.cliente?.apellidos ?? '';

    return (
      `${nombre} ${apellidos}`.trim() ||
      'Cliente'
    );
  }

  getNombreProfesional(
    cita: Cita,
  ): string {
    const nombre =
      cita.profesional?.usuario
        ?.nombre ?? '';

    const apellidos =
      cita.profesional?.usuario
        ?.apellidos ?? '';

    return (
      `${nombre} ${apellidos}`.trim() ||
      'Profesional'
    );
  }

  getNombrePersona(
    cita: Cita,
  ): string {
    if (
      this.rol() ===
      Role.PROFESIONAL
    ) {
      return this.getNombreCliente(
        cita,
      );
    }

    return this.getNombreProfesional(
      cita,
    );
  }

  getNombreServicio(
    cita: Cita,
  ): string {
    return (
      cita.servicio?.nombre ??
      'Servicio'
    );
  }

  formatearDia(
    fecha: Date,
  ): string {
    return new Intl.DateTimeFormat(
      'es-CR',
      {
        weekday: 'short',
      },
    ).format(fecha);
  }

  formatearNumeroDia(
    fecha: Date,
  ): string {
    return new Intl.DateTimeFormat(
      'es-CR',
      {
        day: '2-digit',
      },
    ).format(fecha);
  }

  formatearPeriodo(): string {
    const inicio =
      this.inicioSemana();

    const fin =
      this.finSemana();

    const inicioTexto =
      new Intl.DateTimeFormat(
        'es-CR',
        {
          day: '2-digit',
          month: 'short',
        },
      ).format(inicio);

    const finTexto =
      new Intl.DateTimeFormat(
        'es-CR',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      ).format(fin);

    return `${inicioTexto} - ${finTexto}`;
  }

  formatearHoraNumero(
    hora: number,
  ): string {
    const fecha =
      new Date();

    fecha.setHours(
      hora,
      0,
      0,
      0,
    );

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(fecha);
  }

  formatearHorario(
    cita: Cita,
  ): string {
    return `${this.formatearHora(
      cita.horaInicio,
    )} - ${this.formatearHora(
      cita.horaFinalizacion,
    )}`;
  }

  private formatearHora(
    fecha: string | Date,
  ): string {
    return new Intl.DateTimeFormat(
      'es-CR',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(
      new Date(fecha),
    );
  }

  private mismaFecha(
    fechaCita: string | Date,
    fecha: Date,
  ): boolean {
    const cita =
      new Date(fechaCita);

    return (
      cita.getFullYear() ===
      fecha.getFullYear() &&
      cita.getMonth() ===
      fecha.getMonth() &&
      cita.getDate() ===
      fecha.getDate()
    );
  }
}