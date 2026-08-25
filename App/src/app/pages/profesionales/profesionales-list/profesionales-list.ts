import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
    Modalidad,
    PerfilProfesional,
} from '../../../core/models/perfil-profesional.model';

import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';

@Component({
    selector: 'app-profesionales-list',
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
        MatSlideToggleModule,
    ],
    templateUrl: './profesionales-list.html',
    styleUrl: './profesionales-list.css',
})
export class ProfesionalesList implements OnInit {
    private readonly profesionalService = inject(
        PerfilProfesionalService,
    );

    profesionales = signal<PerfilProfesional[]>([]);

    search = signal('');

    modalidadSeleccionada =
        signal<Modalidad | null>(null);

    loading = signal(false);

    error = signal<string | null>(null);

    profesionalActualizando =
        signal<number | null>(null);

    readonly modalidades: {
        value: Modalidad;
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
        {
            value: 'MIXTA',
            label: 'Mixta',
        },
    ];

    profesionalesFiltrados = computed(() => {
        const texto = this.search()
            .trim()
            .toLowerCase();

        const modalidadSeleccionada =
            this.modalidadSeleccionada();

        return this.profesionales().filter(
            (profesional) => {
                const nombre =
                    profesional.usuario?.nombre
                        ?.toLowerCase() ?? '';

                const apellidos =
                    profesional.usuario?.apellidos
                        ?.toLowerCase() ?? '';

                const nombreCompleto =
                    `${nombre} ${apellidos}`.trim();

                const correo =
                    profesional.usuario?.email
                        ?.toLowerCase() ?? '';

                const titulo =
                    profesional.tituloProfesional
                        ?.toLowerCase() ?? '';

                const descripcion =
                    profesional.descripcion
                        ?.toLowerCase() ?? '';

                const provincia =
                    profesional.provincia
                        ?.toLowerCase() ?? '';

                const canton =
                    profesional.canton
                        ?.toLowerCase() ?? '';

                const distrito =
                    profesional.distrito
                        ?.toLowerCase() ?? '';

                const especialidades =
                    profesional.especialidades
                        ?.map((especialidad) =>
                            especialidad.nombre.toLowerCase(),
                        )
                        .join(' ') ?? '';

                const coincideTexto =
                    texto.length === 0 ||
                    nombre.includes(texto) ||
                    apellidos.includes(texto) ||
                    nombreCompleto.includes(texto) ||
                    correo.includes(texto) ||
                    titulo.includes(texto) ||
                    descripcion.includes(texto) ||
                    provincia.includes(texto) ||
                    canton.includes(texto) ||
                    distrito.includes(texto) ||
                    especialidades.includes(texto);

                const coincideModalidad =
                    modalidadSeleccionada === null ||
                    profesional.modalidad ===
                        modalidadSeleccionada;

                return (
                    coincideTexto &&
                    coincideModalidad
                );
            },
        );
    });

    totalProfesionales = computed(
        () =>
            this.profesionalesFiltrados().length,
    );

    totalDisponibles = computed(
        () =>
            this.profesionales().filter(
                (profesional) =>
                    profesional.disponible,
            ).length,
    );

    totalNoDisponibles = computed(
        () =>
            this.profesionales().filter(
                (profesional) =>
                    !profesional.disponible,
            ).length,
    );

    ngOnInit(): void {
        this.loadProfesionales();
    }

    loadProfesionales(): void {
        this.loading.set(true);
        this.error.set(null);

        this.profesionalService.listar().subscribe({
            next: (response) => {
                const profesionales =
                    this.obtenerLista<PerfilProfesional>(
                        response.data,
                    );

                this.profesionales.set(
                    profesionales,
                );

                this.loading.set(false);

                console.log(
                    'Profesionales cargados:',
                    profesionales,
                );
            },

            error: (error) => {
                console.error(
                    'Error al cargar profesionales:',
                    error,
                );

                this.error.set(
                    'No se pudieron cargar los profesionales.',
                );

                this.loading.set(false);
            },
        });
    }

    clearFilters(): void {
        this.search.set('');
        this.modalidadSeleccionada.set(null);
    }

    getNombreCompleto(
        profesional: PerfilProfesional,
    ): string {
        const nombre =
            profesional.usuario?.nombre ?? '';

        const apellidos =
            profesional.usuario?.apellidos ?? '';

        const nombreCompleto =
            `${nombre} ${apellidos}`.trim();

        return (
            nombreCompleto ||
            'Profesional sin usuario'
        );
    }



getImagenPerfil(
    profesional: PerfilProfesional,
): string {
    const imagen =
        profesional.imagenPerfil?.trim();

    if (!imagen) {
        return `${environment.apiUrl}/images/profile-not-found.jpg`;
    }

    if (
        imagen.startsWith('http://') ||
        imagen.startsWith('https://')
    ) {
        return imagen;
    }

    return `${environment.apiUrl}/images/${imagen}`;
}





    getUbicacion(
        profesional: PerfilProfesional,
    ): string {
        const ubicacion = [
            profesional.provincia,
            profesional.canton,
            profesional.distrito,
        ].filter(Boolean);

        return ubicacion.length > 0
            ? ubicacion.join(', ')
            : 'Ubicación no registrada';
    }

    getModalidadLabel(
        modalidad: Modalidad,
    ): string {
        const etiquetas: Record<Modalidad, string> = {
            VIRTUAL: 'Virtual',
            PRESENCIAL: 'Presencial',
            MIXTA: 'Mixta',
        };

        return etiquetas[modalidad];
    }

    getModalidadIcon(
        modalidad: Modalidad,
    ): string {
        const iconos: Record<Modalidad, string> = {
            VIRTUAL: 'videocam',
            PRESENCIAL: 'location_on',
            MIXTA: 'sync_alt',
        };

        return iconos[modalidad];
    }

    getEspecialidades(
        profesional: PerfilProfesional,
    ): string {
        if (
            !profesional.especialidades ||
            profesional.especialidades.length === 0
        ) {
            return 'Sin especialidades';
        }

        return profesional.especialidades
            .map(
                (especialidad) =>
                    especialidad.nombre,
            )
            .join(', ');
    }

    toggleDisponibilidad(
        profesional: PerfilProfesional,
    ): void {
        const nuevaDisponibilidad =
            !profesional.disponible;

        this.profesionalActualizando.set(
            profesional.id,
        );

        this.error.set(null);

        this.profesionalService
            .cambiarDisponibilidad(
                profesional.id,
                {
                    disponible:
                        nuevaDisponibilidad,
                },
            )
            .subscribe({
                next: (response) => {
                    const profesionalActualizado =
                        response.data;

                    this.profesionales.update(
                        (profesionales) =>
                            profesionales.map(
                                (item) =>
                                    item.id ===
                                    profesional.id
                                        ? {
                                              ...item,
                                              ...profesionalActualizado,
                                          }
                                        : item,
                            ),
                    );

                    this.profesionalActualizando.set(
                        null,
                    );

                    console.log(
                        nuevaDisponibilidad
                            ? 'Profesional disponible'
                            : 'Profesional no disponible',
                        profesionalActualizado,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error al cambiar la disponibilidad:',
                        error,
                    );

                    this.error.set(
                        'No se pudo cambiar la disponibilidad del profesional.',
                    );

                    this.profesionalActualizando.set(
                        null,
                    );
                },
            });
    }

    estaActualizando(
        profesionalId: number,
    ): boolean {
        return (
            this.profesionalActualizando() ===
            profesionalId
        );
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