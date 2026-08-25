import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Cita } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-citas-profesional-list',
    standalone: true,
    imports: [
        FormsModule,
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
    ],
    templateUrl: './citas-profesional-list.html',
    styleUrl: './citas-profesional-list.css',
})
export class CitasProfesionalList implements OnInit {

    private readonly citaService =
        inject(CitaService);

    private readonly notificationService =
        inject(NotificationService);

    citas = signal<Cita[]>([]);

    search = signal('');

    estadoSeleccionado =
        signal<string | null>(null);

    modalidadSeleccionada =
        signal<string | null>(null);

    loading = signal(false);

    error = signal<string | null>(null);

    /*
     * Guarda el ID de la cita sobre la cual
     * se está realizando una acción.
     */
    citaActualizando =
        signal<number | null>(null);

    readonly estados = [
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

    readonly modalidades = [
        {
            value: 'VIRTUAL',
            label: 'Virtual',
        },
        {
            value: 'PRESENCIAL',
            label: 'Presencial',
        },
    ];

    citasFiltradas = computed(() => {
        const texto = this.search()
            .trim()
            .toLowerCase();

        const estado =
            this.estadoSeleccionado();

        const modalidad =
            this.modalidadSeleccionada();

        return this.citas().filter((cita) => {

            const cliente =
                this.getNombreCliente(cita)
                    .toLowerCase();

            const servicio =
                cita.servicio?.nombre
                    ?.toLowerCase() ?? '';

            const coincideTexto =
                !texto ||
                cliente.includes(texto) ||
                servicio.includes(texto);

            const coincideEstado =
                !estado ||
                cita.estado === estado;

            const coincideModalidad =
                !modalidad ||
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

    ngOnInit(): void {
        this.loadSolicitudes();
    }

    loadSolicitudes(): void {
        this.loading.set(true);
        this.error.set(null);

        this.citaService
            .misSolicitudes()
            .subscribe({
                next: (response) => {
                    this.citas.set(
                        response.data ?? [],
                    );

                    this.loading.set(false);
                },

                error: (error) => {
                    console.error(
                        'Error cargando solicitudes:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No se pudieron cargar las solicitudes.',
                    );

                    this.loading.set(false);
                },
            });
    }

    clearFilters(): void {
        this.search.set('');
        this.estadoSeleccionado.set(null);
        this.modalidadSeleccionada.set(null);
    }

    aceptarCita(cita: Cita): void {
        if (
            cita.estado !== 'PENDIENTE' ||
            this.estaActualizando(cita.id)
        ) {
            return;
        }

        this.citaActualizando.set(
            cita.id,
        );

        this.error.set(null);

        this.citaService
            .aceptar(cita.id)
            .subscribe({
                next: (response) => {
                    const citaActualizada =
                        response.data;

                    this.citas.update(
                        (citas) =>
                            citas.map((item) =>
                                item.id === cita.id
                                    ? {
                                          ...item,
                                          ...citaActualizada,
                                      }
                                    : item,
                            ),
                    );

                    this.notificationService.success(
                        'Cita aceptada correctamente',
                    );

                    this.citaActualizando.set(
                        null,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error aceptando cita:',
                        error,
                    );

                    this.notificationService.error(
                        error?.error?.message ??
                        'No se pudo aceptar la cita',
                    );

                    this.citaActualizando.set(
                        null,
                    );
                },
            });
    }

    rechazarCita(cita: Cita): void {
    if (
        cita.estado !== 'PENDIENTE' ||
        this.estaActualizando(cita.id)
    ) {
        return;
    }

    const comentarioProfesional =
        window.prompt(
            'Indique el motivo del rechazo:',
        );

    if (
        !comentarioProfesional ||
        comentarioProfesional.trim().length < 3
    ) {
        this.notificationService.error(
            'Debe indicar un motivo válido para rechazar la cita',
        );

        return;
    }

    this.citaActualizando.set(
        cita.id,
    );

    this.error.set(null);

    this.citaService
        .rechazar(
            cita.id,
            comentarioProfesional.trim(),
        )
        .subscribe({
            next: (response) => {
                const citaActualizada =
                    response.data;

                this.citas.update(
                    (citas) =>
                        citas.map((item) =>
                            item.id === cita.id
                                ? {
                                      ...item,
                                      ...citaActualizada,
                                  }
                                : item,
                        ),
                );

                this.notificationService.success(
                    'Cita rechazada correctamente',
                );

                this.citaActualizando.set(
                    null,
                );
            },

            error: (error) => {
                console.error(
                    'Error rechazando cita:',
                    error,
                );

                this.notificationService.error(
                    error?.error?.message ??
                    'No se pudo rechazar la cita',
                );

                this.citaActualizando.set(
                    null,
                );
            },
        });
}

    estaActualizando(
        citaId: number,
    ): boolean {
        return (
            this.citaActualizando() ===
            citaId
        );
    }

    puedeAceptar(cita: Cita): boolean {
        return (
            cita.estado === 'PENDIENTE'
        );
    }
    puedeRechazar(cita: Cita): boolean {
    return (
        cita.estado === 'PENDIENTE'
    );
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

    getEstadoLabel(
        estado: string,
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

            default:
                return estado;
        }
    }

    getEstadoIcon(
        estado: string,
    ): string {
        switch (estado) {
            case 'PENDIENTE':
                return 'schedule';

            case 'ACEPTADA':
                return 'check_circle';

            case 'RECHAZADA':
                return 'cancel';

            case 'CANCELADA':
                return 'block';

            case 'COMPLETADA':
                return 'task_alt';

            default:
                return 'event';
        }
    }

    getModalidadLabel(
        modalidad: string,
    ): string {
        switch (modalidad) {
            case 'VIRTUAL':
                return 'Virtual';

            case 'PRESENCIAL':
                return 'Presencial';

            default:
                return modalidad;
        }
    }

    formatearFecha(
        fecha: string | Date,
    ): string {
        const date =
            new Date(fecha);

        return new Intl.DateTimeFormat(
            'es-CR',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            },
        ).format(date);
    }

    getHorario(cita: Cita): string {
        return `${this.formatearHora(
            cita.horaInicio,
        )} - ${this.formatearHora(
            cita.horaFinalizacion,
        )}`;
    }

    private formatearHora(
        hora: string | Date,
    ): string {
        const date =
            new Date(hora);

        return new Intl.DateTimeFormat(
            'es-CR',
            {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            },
        ).format(date);
    }
}