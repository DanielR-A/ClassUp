import {
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import {
    ActivatedRoute,
    RouterLink,
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
    Cita,
    EstadoCita,
    ModalidadCita,
} from '../../../core/models/cita.model';

import { CitaService } from '../../../core/services/cita.service';

@Component({
    selector: 'app-cita-detail',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './cita-detail.html',
    styleUrl: './cita-detail.css',
})
export class CitaDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);

    private readonly citaService = inject(
        CitaService,
    );

    cita = signal<Cita | null>(null);

    loading = signal(false);

    error = signal<string | null>(null);

    ngOnInit(): void {
        const idParam =
            this.route.snapshot.paramMap.get('id');

        const id = Number(idParam);

        if (
            !idParam ||
            Number.isNaN(id) ||
            id <= 0
        ) {
            this.error.set(
                'El identificador de la cita no es válido.',
            );

            return;
        }

        this.loadCita(id);
    }

    loadCita(id: number): void {
        this.loading.set(true);
        this.error.set(null);

        this.citaService.obtenerPorId(id).subscribe({
            next: (response) => {
                this.cita.set(response.data);

                this.loading.set(false);

                console.log(
                    'Detalle de la cita cargado:',
                    response.data,
                );
            },

            error: (error) => {
                console.error(
                    'Error al cargar la cita:',
                    error,
                );

                this.error.set(
                    'No se pudo cargar el detalle de la cita.',
                );

                this.loading.set(false);
            },
        });
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
            cita.profesional?.usuario?.nombre ??
            '';

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
                weekday: 'long',
                day: '2-digit',
                month: 'long',
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

    getComentarioCliente(
        cita: Cita,
    ): string {
        return (
            cita.comentarioCliente?.trim() ||
            'El cliente no agregó comentarios.'
        );
    }

    getComentarioProfesional(
        cita: Cita,
    ): string {
        return (
            cita.comentarioProfesional?.trim() ||
            'El profesional no agregó comentarios.'
        );
    }
}