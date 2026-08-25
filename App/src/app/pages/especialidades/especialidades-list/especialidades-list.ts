import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { MatSelectModule } from '@angular/material/select';
import { Especialidad } from '../../../core/models/especialidad.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';

@Component({
    selector: 'app-especialidades-list',
    standalone: true,
    imports: [
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
    templateUrl: './especialidades-list.html',
    styleUrl: './especialidades-list.css',
})
export class EspecialidadesList implements OnInit {
    private readonly especialidadService = inject(
        EspecialidadService,
    );

    especialidades = signal<Especialidad[]>([]);

    search = signal('');
    descripcionFiltro = signal('');
    estadoFiltro = signal<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
    loading = signal(false);
    error = signal<string | null>(null);

    displayedColumns: string[] = [
        'id',
        'especialidad',
        'descripcion',
        'profesionales',
        'servicios',
        'estado',
        'fechaRegistro',
        'acciones',
    ];




especialidadesFiltradas = computed(() => {
    const texto = this.search()
        .trim()
        .toLowerCase();

    const descripcionTexto =
        this.descripcionFiltro()
            .trim()
            .toLowerCase();

    const estado = this.estadoFiltro();

    return this.especialidades().filter(
        (especialidad) => {

            const nombre =
                especialidad.nombre
                    ?.toLowerCase() ?? '';

            const descripcion =
                especialidad.descripcion
                    ?.toLowerCase() ?? '';

            const coincideNombre =
                !texto ||
                nombre.includes(texto);

            const coincideDescripcion =
                !descripcionTexto ||
                descripcion.includes(
                    descripcionTexto,
                );

            const coincideEstado =
                estado === 'TODOS' ||
                (
                    estado === 'ACTIVOS' &&
                    especialidad.estado
                ) ||
                (
                    estado === 'INACTIVOS' &&
                    !especialidad.estado
                );

            return (
                coincideNombre &&
                coincideDescripcion &&
                coincideEstado
            );
        },
    );
});

    totalEspecialidades = computed(
        () => this.especialidadesFiltradas().length,
    );

    totalActivas = computed(
        () =>
            this.especialidades().filter(
                (especialidad) =>
                    especialidad.estado,
            ).length,
    );

    totalInactivas = computed(
        () =>
            this.especialidades().filter(
                (especialidad) =>
                    !especialidad.estado,
            ).length,
    );

    ngOnInit(): void {
        this.loadEspecialidades();
    }

    loadEspecialidades(): void {
        this.loading.set(true);
        this.error.set(null);

        this.especialidadService.listar().subscribe({
            next: (response) => {
                const especialidades =
                    this.obtenerLista<Especialidad>(
                        response.data,
                    );

                this.especialidades.set(
                    especialidades,
                );

                this.loading.set(false);

                console.log(
                    'Especialidades cargadas:',
                    especialidades,
                );
            },

            error: (error) => {
                console.error(
                    'Error al cargar especialidades:',
                    error,
                );

                this.error.set(
                    'No se pudieron cargar las especialidades.',
                );

                this.loading.set(false);
            },
        });
    }

    clearSearch(): void {
        this.search.set('');
        this.descripcionFiltro.set('');
        this.estadoFiltro.set('TODOS');
    }

    toggleEstado(
        especialidad: Especialidad,
    ): void {
        const nuevoEstado =
            !especialidad.estado;

        this.especialidadService
            .cambiarEstado(
                especialidad.id,
                {
                    estado: nuevoEstado,
                },
            )
            .subscribe({
                next: (response) => {
                    const especialidadActualizada =
                        response.data;

                    this.especialidades.update(
                        (especialidades) =>
                            especialidades.map(
                                (item) =>
                                    item.id ===
                                    especialidad.id
                                        ? {
                                              ...item,
                                              ...especialidadActualizada,
                                          }
                                        : item,
                            ),
                    );

                    console.log(
                        nuevoEstado
                            ? 'Especialidad activada'
                            : 'Especialidad desactivada',
                        especialidadActualizada,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error al cambiar el estado de la especialidad:',
                        error,
                    );

                    this.error.set(
                        'No se pudo cambiar el estado de la especialidad.',
                    );
                },
            });
    }

    getCantidadProfesionales(
        especialidad: Especialidad,
    ): number {
        return (
            especialidad.profesionales?.length ?? 0
        );
    }

    getCantidadServicios(
        especialidad: Especialidad,
    ): number {
        return (
            especialidad.servicios?.length ?? 0
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