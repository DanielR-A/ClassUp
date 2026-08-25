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

import {
    Cita,
    EstadoCita,
} from '../../../core/models/cita.model';

import { CitaService } from '../../../core/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-citas-cliente-list',
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
    templateUrl: './citas-cliente-list.html',
    styleUrl: './citas-cliente-list.css',
})
export class CitasClienteList implements OnInit {

    private readonly citaService =
        inject(CitaService);

    private readonly notificationService =
        inject(NotificationService);

    citas = signal<Cita[]>([]);

    loading = signal(false);

    error = signal<string | null>(null);

    /*
     * Guarda el ID de la cita que está
     * realizando una acción.
     */
    citaActualizando =
        signal<number | null>(null);

    estadoSeleccionado =
        signal<EstadoCita | null>(null);

    fechaDesde =
        signal('');

    fechaHasta =
        signal('');

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
     * Combina:
     *
     * estado
     * fecha desde
     * fecha hasta
     */
    citasFiltradas = computed(() => {
        const estado =
            this.estadoSeleccionado();

        const desde =
            this.fechaDesde();

        const hasta =
            this.fechaHasta();

        return this.citas().filter((cita) => {

            const fechaCita =
                new Date(cita.fechaCita);

            const coincideEstado =
                !estado ||
                cita.estado === estado;

            const coincideDesde =
                !desde ||
                fechaCita >=
                    new Date(
                        `${desde}T00:00:00`,
                    );

            const coincideHasta =
                !hasta ||
                fechaCita <=
                    new Date(
                        `${hasta}T23:59:59`,
                    );

            return (
                coincideEstado &&
                coincideDesde &&
                coincideHasta
            );
        });
    });

    totalCitas = computed(
        () => this.citasFiltradas().length,
    );

    ngOnInit(): void {
        this.loadCitas();
    }

    /*
     * Obtiene únicamente las citas
     * del cliente autenticado.
     */
    loadCitas(): void {
        this.loading.set(true);
        this.error.set(null);

        this.citaService
            .misCitasCliente()
            .subscribe({
                next: (response) => {
                    this.citas.set(
                        response.data ?? [],
                    );

                    this.loading.set(false);
                },

                error: (error) => {
                    console.error(
                        'Error cargando citas del cliente:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No se pudieron cargar sus citas.',
                    );

                    this.loading.set(false);
                },
            });
    }

    /*
     * Limpia todos los filtros.
     */
    clearFilters(): void {
        this.estadoSeleccionado.set(null);
        this.fechaDesde.set('');
        this.fechaHasta.set('');
    }

    /*
     * El cliente puede cancelar únicamente
     * una cita Pendiente o Aceptada.
     */
    puedeCancelar(
        cita: Cita,
    ): boolean {
        return (
            cita.estado === 'PENDIENTE' ||
            cita.estado === 'ACEPTADA'
        );
    }

    /*
     * Evita ejecutar más de una acción
     * sobre la misma cita al mismo tiempo.
     */
    estaActualizando(
        citaId: number,
    ): boolean {
        return (
            this.citaActualizando() ===
            citaId
        );
    }

    /*
     * Cancela una cita del cliente.
     */
    cancelarCita(
        cita: Cita,
    ): void {
        if (
            !this.puedeCancelar(cita) ||
            this.estaActualizando(cita.id)
        ) {
            return;
        }

        const comentarioCliente =
            window.prompt(
                'Indique el motivo de la cancelación:',
            );

        if (
            !comentarioCliente ||
            comentarioCliente.trim().length < 3
        ) {
            this.notificationService.error(
                'Debe indicar un motivo válido para cancelar la cita',
            );

            return;
        }

        this.citaActualizando.set(
            cita.id,
        );

        this.error.set(null);

        this.citaService
            .cancelar(
                cita.id,
                comentarioCliente.trim(),
            )
            .subscribe({
                next: (response) => {
                    const citaActualizada =
                        response.data;

                    /*
                     * Actualiza únicamente la cita
                     * modificada sin recargar la página.
                     */
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
                        'Cita cancelada correctamente',
                    );

                    this.citaActualizando.set(
                        null,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error cancelando cita:',
                        error,
                    );

                    this.notificationService.error(
                        error?.error?.message ??
                        'No se pudo cancelar la cita',
                    );

                    this.citaActualizando.set(
                        null,
                    );
                },
            });
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

    getEstadoIcon(
        estado: EstadoCita,
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
        }
    }

    getModalidadLabel(
        modalidad: string,
    ): string {
        return modalidad === 'VIRTUAL'
            ? 'Virtual'
            : 'Presencial';
    }

    getNombreProfesional(
        cita: Cita,
    ): string {
        const nombre =
            cita.profesional?.usuario?.nombre ?? '';

        const apellidos =
            cita.profesional?.usuario?.apellidos ?? '';

        return (
            `${nombre} ${apellidos}`.trim() ||
            'Profesional'
        );
    }

    formatearFecha(
        fecha: string | Date,
    ): string {
        return new Intl.DateTimeFormat(
            'es-CR',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            },
        ).format(
            new Date(fecha),
        );
    }

    getHorario(
        cita: Cita,
    ): string {
        return `${this.formatearHora(
            cita.horaInicio,
        )} - ${this.formatearHora(
            cita.horaFinalizacion,
        )}`;
    }

    private formatearHora(
        hora: string | Date,
    ): string {
        return new Intl.DateTimeFormat(
            'es-CR',
            {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            },
        ).format(
            new Date(hora),
        );
    }
}