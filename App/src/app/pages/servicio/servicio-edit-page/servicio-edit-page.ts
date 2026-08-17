import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

import { ServicioForm } from '../../../shared/components/servicio-form/servicio-form';

import { ServicioService } from '../../../core/services/servicio.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';

import {
    Servicio,
    ServicioCreateDto,
    ServicioUpdateDto,
} from '../../../core/models/servicio.model';

import { Categoria } from '../../../core/models/categoria.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';

@Component({
    selector: 'app-servicio-edit-page',
    standalone: true,
    imports: [ServicioForm],
    templateUrl: './servicio-edit-page.html',
})
export class ServicioEditPage {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly servicioService = inject(ServicioService);
    private readonly categoriaService = inject(CategoriaService);
    private readonly especialidadService = inject(EspecialidadService);
    private readonly perfilProfesionalService = inject(
        PerfilProfesionalService,
    );

    servicio = signal<Servicio | null>(null);

    categorias = signal<Categoria[]>([]);
    profesionales = signal<PerfilProfesional[]>([]);
    especialidades = signal<Especialidad[]>([]);

    loading = signal(true);
    saving = signal(false);
    error = signal<string | null>(null);

    private readonly id = Number(
        this.route.snapshot.paramMap.get('id'),
    );

    constructor() {
        this.cargarDatosFormulario();
    }

    cargarDatosFormulario(): void {
        if (!this.id || Number.isNaN(this.id)) {
            this.error.set(
                'El identificador del servicio no es válido.',
            );
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        forkJoin({
            servicio: this.servicioService.obtenerPorId(this.id),
            categorias: this.categoriaService.listar(),
            profesionales:
                this.perfilProfesionalService.listar(),
            especialidades:
                this.especialidadService.listar(),
        })
            .pipe(
                finalize(() => {
                    this.loading.set(false);
                }),
            )
            .subscribe({
                next: ({
                    servicio,
                    categorias,
                    profesionales,
                    especialidades,
                }) => {
                    this.servicio.set(servicio.data);

                    this.categorias.set(
                        this.obtenerLista<Categoria>(
                            categorias.data,
                        ),
                    );

                    this.profesionales.set(
                        this.obtenerLista<PerfilProfesional>(
                            profesionales.data,
                        ),
                    );

                    this.especialidades.set(
                        this.obtenerLista<Especialidad>(
                            especialidades.data,
                        ),
                    );
                },
                error: (error) => {
                    console.error(
                        'Error cargando datos del servicio:',
                        error,
                    );

                    this.error.set(
                        'No se pudo cargar la información del servicio.',
                    );
                },
            });
    }

    guardar(
        data: ServicioCreateDto | ServicioUpdateDto,
    ): void {
        if (!this.id || Number.isNaN(this.id)) {
            return;
        }

        this.saving.set(true);
        this.error.set(null);

        const servicioData = data as ServicioUpdateDto;

        console.log(
            'Datos para actualizar servicio:',
            servicioData,
        );

        this.servicioService
            .actualizar(this.id, servicioData)
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: (response) => {
                    console.log(
                        'Servicio actualizado:',
                        response.data,
                    );

                    this.router.navigate([
                        '/admin/servicios',
                    ]);
                },
                error: (error) => {
                    console.error(
                        'Error actualizando servicio:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ||
                            'No se pudo actualizar el servicio.',
                    );
                },
            });
    }

    cancelar(): void {
        this.router.navigate(['/admin/servicios']);
    }

    private obtenerLista<T>(
        data: T[] | { data: T[] } | null | undefined,
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