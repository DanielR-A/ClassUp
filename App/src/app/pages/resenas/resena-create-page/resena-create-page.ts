import {
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
    RouterLink,
} from '@angular/router';

import {
    finalize,
} from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FormsModule } from '@angular/forms';

import { Cita } from '../../../core/models/cita.model';
import {
    ResenaCreateDto,
} from '../../../core/models/resena.model';

import { CitaService } from '../../../core/services/cita.service';
import { ResenaService } from '../../../core/services/resena.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-resena-create-page',
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
    ],
    templateUrl: './resena-create-page.html',
    styleUrl: './resena-create-page.css',
})
export class ResenaCreatePage implements OnInit {

    private readonly route =
        inject(ActivatedRoute);

    private readonly router =
        inject(Router);

    private readonly citaService =
        inject(CitaService);

    private readonly resenaService =
        inject(ResenaService);

    private readonly notificationService =
        inject(NotificationService);

    cita =
        signal<Cita | null>(null);

    puntuacion =
        signal<number>(0);

    comentario =
        signal('');

    loading =
        signal(false);

    saving =
        signal(false);

    error =
        signal<string | null>(null);

    readonly estrellas = [
        1,
        2,
        3,
        4,
        5,
    ];

    ngOnInit(): void {
        this.loadCita();
    }

    loadCita(): void {
        const rawId =
            this.route.snapshot.paramMap.get(
                'id',
            );

        const citaId =
            Number(rawId);

        if (
            !rawId ||
            Number.isNaN(citaId)
        ) {
            this.error.set(
                'El ID de la cita no es válido.',
            );

            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.citaService
            .obtenerMiCitaPorId(
                citaId,
            )
            .pipe(
                finalize(() => {
                    this.loading.set(false);
                }),
            )
            .subscribe({
                next: (response) => {
                    const cita =
                        response.data;

                    if (!cita) {
                        this.error.set(
                            'No se pudo cargar la cita.',
                        );

                        return;
                    }

                    /*
                     * Solo citas completadas.
                     */
                    if (
                        cita.estado !==
                        'COMPLETADA'
                    ) {
                        this.error.set(
                            'Solo puede reseñar citas completadas.',
                        );

                        return;
                    }

                    /*
                     * Si ya tiene reseña,
                     * no permitimos otra.
                     */
                    if (cita.resena) {
                        this.error.set(
                            'Esta cita ya tiene una reseña registrada.',
                        );

                        return;
                    }

                    this.cita.set(
                        cita,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error cargando cita para reseña:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No se pudo cargar la cita.',
                    );
                },
            });
    }

    seleccionarPuntuacion(
        valor: number,
    ): void {
        if (
            valor < 1 ||
            valor > 5
        ) {
            return;
        }

        this.puntuacion.set(
            valor,
        );
    }

    guardar(): void {
        if (this.saving()) {
            return;
        }

        const cita =
            this.cita();

        if (!cita) {
            return;
        }

        if (
            this.puntuacion() < 1 ||
            this.puntuacion() > 5
        ) {
            this.notificationService.error(
                'Debe seleccionar una puntuación entre 1 y 5 estrellas.',
            );

            return;
        }

        if (
            this.comentario().length >
            500
        ) {
            this.notificationService.error(
                'El comentario no puede superar los 500 caracteres.',
            );

            return;
        }

        const data:
            ResenaCreateDto = {

            citaId:
                cita.id,

            puntuacion:
                this.puntuacion(),

            comentario:
                this.comentario()
                    .trim() ||
                undefined,
        };

        this.saving.set(true);
        this.error.set(null);

        this.resenaService
            .crear(data)
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: () => {
                    this.notificationService.success(
                        'Reseña registrada correctamente.',
                    );

                    void this.router.navigate([
                        '/mis-citas',
                        cita.id,
                    ]);
                },

                error: (error) => {
                    console.error(
                        'Error registrando reseña:',
                        error,
                    );

                    const mensaje =
                        error?.error?.message ??
                        'No se pudo registrar la reseña.';

                    this.error.set(
                        mensaje,
                    );

                    this.notificationService.error(
                        mensaje,
                    );
                },
            });
    }

    cancelar(): void {
        const cita =
            this.cita();

        if (cita) {
            void this.router.navigate([
                '/mis-citas',
                cita.id,
            ]);

            return;
        }

        void this.router.navigate([
            '/mis-citas',
        ]);
    }

    getNombreProfesional(): string {
        const cita =
            this.cita();

        if (!cita) {
            return 'Profesional';
        }

        const nombre =
            cita.profesional
                ?.usuario
                ?.nombre ?? '';

        const apellidos =
            cita.profesional
                ?.usuario
                ?.apellidos ?? '';

        return (
            `${nombre} ${apellidos}`.trim() ||
            'Profesional'
        );
    }

    getNombreServicio(): string {
        return (
            this.cita()
                ?.servicio
                ?.nombre ??
            'Servicio'
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
}