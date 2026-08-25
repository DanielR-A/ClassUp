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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Cita } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';

@Component({
    selector: 'app-cita-profesional-detail',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './cita-profesional-detail.html',
    styleUrl: './cita-profesional-detail.css',
})
export class CitaProfesionalDetail implements OnInit {

    private readonly route =
        inject(ActivatedRoute);

    private readonly citaService =
        inject(CitaService);

    cita = signal<Cita | null>(null);

    loading = signal(false);

    error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadCita();
    }

    loadCita(): void {
        const rawId =
            this.route.snapshot.paramMap.get('id');

        const id = Number(rawId);

        if (!rawId || Number.isNaN(id)) {
            this.error.set(
                'El ID de la cita no es válido.',
            );

            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.citaService
            .obtenerMiSolicitudPorId(id)
            .subscribe({
                next: (response) => {
                    this.cita.set(
                        response.data,
                    );

                    this.loading.set(false);
                },

                error: (error) => {
                    console.error(
                        'Error cargando el detalle de la cita:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No se pudo cargar el detalle de la cita.',
                    );

                    this.loading.set(false);
                },
            });
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

    formatearFechaHora(
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
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            },
        ).format(date);
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