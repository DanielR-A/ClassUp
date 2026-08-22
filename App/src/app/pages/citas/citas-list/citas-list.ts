import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

import { CitaService } from '../../../core/services/cita.service';

import {
    Cita,
    EstadoCita,
    ModalidadCita,
} from '../../../core/models/cita.model';

@Component({
    selector: 'app-citas-list',
    standalone: true,
    imports: [
        FormsModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
    ],
    templateUrl: './citas-list.html',
    styleUrl: './citas-list.css',
})
export class CitasList implements OnInit {
    private readonly citaService = inject(CitaService);

    // Listado completo de citas
    citas = signal<Cita[]>([]);

    // Filtro de búsqueda
    search = signal('');

    // Estado seleccionado
    estadoSeleccionado = signal<EstadoCita | null>(
        null,
    );

    // Modalidad seleccionada
    modalidadSeleccionada =
        signal<ModalidadCita | null>(null);

    // Estado de carga del API
    loading = signal(false);

    // Mensaje de error del API
    error = signal<string | null>(null);

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

    readonly modalidades: {
        value: ModalidadCita;
        label: string;
    }[] = [
        {
            value: 'VIRTUAL',
            label: 'Virtual',
        },
        {
            value: 'PRESENCIAL',
            label: 'Presencial',
        },
    ];

    ngOnInit(): void {
        this.loadCitas();
    }

    loadCitas(): void {
        this.loading.set(true);
        this.error.set(null);

        this.citaService.listar().subscribe({
            next: (response) => {
                console.log(
                    'Respuesta de citas:',
                    response,
                );

                const citas =
                    this.obtenerLista<Cita>(
                        response.data,
                    );

                this.citas.set(citas);
                this.loading.set(false);

                console.log(
                    'Citas cargadas:',
                    citas,
                );
            },

            error: (error) => {
                console.error(
                    'Error al cargar citas:',
                    error,
                );

                this.error.set(
                    'No se pudieron cargar las citas.',
                );

                this.loading.set(false);
            },
        });
    }

    citasFiltradas = computed(() => {
        const texto = this.search()
            .trim()
            .toLowerCase();

        const estado =
            this.estadoSeleccionado();

        const modalidad =
            this.modalidadSeleccionada();

        return this.citas().filter((cita) => {
            const clienteNombre =
                cita.cliente
                    ? `${cita.cliente.nombre ?? ''} ${
                          cita.cliente.apellidos ?? ''
                      }`
                          .trim()
                          .toLowerCase()
                    : '';

            const clienteCorreo =
                cita.cliente?.email
                    ?.toLowerCase() ?? '';

            const profesionalNombre =
                cita.profesional?.usuario
                    ? `${
                          cita.profesional.usuario
                              .nombre ?? ''
                      } ${
                          cita.profesional.usuario
                              .apellidos ?? ''
                      }`
                          .trim()
                          .toLowerCase()
                    : '';

            const profesionalTitulo =
                cita.profesional
                    ?.tituloProfesional
                    ?.toLowerCase() ?? '';

            const servicioNombre =
                cita.servicio?.nombre
                    ?.toLowerCase() ?? '';

            const comentarioCliente =
                cita.comentarioCliente
                    ?.toLowerCase() ?? '';

            const coincideTexto =
                texto.length === 0 ||
                clienteNombre.includes(texto) ||
                clienteCorreo.includes(texto) ||
                profesionalNombre.includes(texto) ||
                profesionalTitulo.includes(texto) ||
                servicioNombre.includes(texto) ||
                comentarioCliente.includes(texto);

            const coincideEstado =
                estado === null ||
                cita.estado === estado;

            const coincideModalidad =
                modalidad === null ||
                cita.modalidad === modalidad;

            return (
                coincideTexto &&
                coincideEstado &&
                coincideModalidad
            );
        });
    });

    totalCitas = computed(
        () => this.citasFiltradas().length,
    );

    totalPendientes = computed(
        () =>
            this.citas().filter(
                (cita) =>
                    cita.estado === 'PENDIENTE',
            ).length,
    );

    totalAceptadas = computed(
        () =>
            this.citas().filter(
                (cita) =>
                    cita.estado === 'ACEPTADA',
            ).length,
    );

    totalCompletadas = computed(
        () =>
            this.citas().filter(
                (cita) =>
                    cita.estado === 'COMPLETADA',
            ).length,
    );

    clearFilters(): void {
        this.search.set('');
        this.estadoSeleccionado.set(null);
        this.modalidadSeleccionada.set(null);
    }

    getNombreCliente(cita: Cita): string {
        const nombre =
            cita.cliente?.nombre ?? '';

        const apellidos =
            cita.cliente?.apellidos ?? '';

        return (
            `${nombre} ${apellidos}`.trim() ||
            'Cliente no registrado'
        );
    }

    getNombreProfesional(cita: Cita): string {
        const nombre =
            cita.profesional?.usuario
                ?.nombre ?? '';

        const apellidos =
            cita.profesional?.usuario
                ?.apellidos ?? '';

        return (
            `${nombre} ${apellidos}`.trim() ||
            'Profesional no registrado'
        );
    }

    getEstadoLabel(
        estado: EstadoCita,
    ): string {
        const etiquetas: Record<
            EstadoCita,
            string
        > = {
            PENDIENTE: 'Pendiente',
            ACEPTADA: 'Aceptada',
            RECHAZADA: 'Rechazada',
            CANCELADA: 'Cancelada',
            COMPLETADA: 'Completada',
        };

        return etiquetas[estado];
    }

    getEstadoIcon(
        estado: EstadoCita,
    ): string {
        const iconos: Record<
            EstadoCita,
            string
        > = {
            PENDIENTE: 'schedule',
            ACEPTADA: 'check_circle',
            RECHAZADA: 'cancel',
            CANCELADA: 'block',
            COMPLETADA: 'task_alt',
        };

        return iconos[estado];
    }

    getModalidadLabel(
        modalidad: ModalidadCita,
    ): string {
        const etiquetas: Record<
            ModalidadCita,
            string
        > = {
            VIRTUAL: 'Virtual',
            PRESENCIAL: 'Presencial',
        };

        return etiquetas[modalidad];
    }

    getModalidadIcon(
        modalidad: ModalidadCita,
    ): string {
        const iconos: Record<
            ModalidadCita,
            string
        > = {
            VIRTUAL: 'videocam',
            PRESENCIAL: 'location_on',
        };

        return iconos[modalidad];
    }

    formatearFecha(
        fecha: string | Date,
    ): string {
        if (!fecha) {
            return 'Fecha no registrada';
        }

        const fechaConvertida =
            typeof fecha === 'string'
                ? new Date(fecha)
                : fecha;

        if (
            Number.isNaN(
                fechaConvertida.getTime(),
            )
        ) {
            return 'Fecha inválida';
        }

        return fechaConvertida.toLocaleDateString(
            'es-CR',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            },
        );
    }

    formatearHora(
        hora: string | Date,
    ): string {
        if (!hora) {
            return '--:--';
        }

        if (typeof hora === 'string') {
            const coincidencia =
                hora.match(
                    /(\d{2}):(\d{2})/,
                );

            return coincidencia
                ? `${coincidencia[1]}:${coincidencia[2]}`
                : hora;
        }

        return `${String(
            hora.getHours(),
        ).padStart(2, '0')}:${String(
            hora.getMinutes(),
        ).padStart(2, '0')}`;
    }

    getHorario(cita: Cita): string {
        return `${this.formatearHora(
            cita.horaInicio,
        )} - ${this.formatearHora(
            cita.horaFinalizacion,
        )}`;
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