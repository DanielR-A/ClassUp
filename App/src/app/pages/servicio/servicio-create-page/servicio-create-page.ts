import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

import { ServicioForm } from '../../../shared/components/servicio-form/servicio-form';

import { ServicioService } from '../../../core/services/servicio.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';

import { Categoria } from '../../../core/models/categoria.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';

import {
    ServicioCreateDto,
    ServicioUpdateDto,
} from '../../../core/models/servicio.model';

@Component({
    selector: 'app-servicio-create-page',
    standalone: true,
    imports: [ServicioForm],
    templateUrl: './servicio-create-page.html',
})
export class ServicioCreatePage {
    private readonly router = inject(Router);

    private readonly servicioService = inject(ServicioService);
    private readonly categoriaService = inject(CategoriaService);
    private readonly especialidadService = inject(EspecialidadService);
    private readonly perfilProfesionalService = inject(
        PerfilProfesionalService,
    );

    categorias = signal<Categoria[]>([]);
    profesionales = signal<PerfilProfesional[]>([]);
    especialidades = signal<Especialidad[]>([]);

    loading = signal(true);
    saving = signal(false);
    error = signal<string | null>(null);

    constructor() {
        this.cargarDatosFormulario();
    }

    cargarDatosFormulario(): void {
        this.loading.set(true);
        this.error.set(null);

        forkJoin({
            categorias: this.categoriaService.listar(),
            profesionales: this.perfilProfesionalService.listar(),
            especialidades: this.especialidadService.listar(),
        })
            .pipe(
                finalize(() => {
                    this.loading.set(false);
                }),
            )
            .subscribe({
                next: ({
                    categorias,
                    profesionales,
                    especialidades,
                }) => {
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
                        'Error cargando datos del formulario:',
                        error,
                    );

                    this.error.set(
                        'No se pudieron cargar los datos del formulario.',
                    );
                },
            });
    }

    guardar(
        data: ServicioCreateDto | ServicioUpdateDto,
    ): void {
        this.saving.set(true);
        this.error.set(null);

        const servicioData = data as ServicioCreateDto;

        console.log('Servicio por registrar:', servicioData);

        this.servicioService
            .crear(servicioData)
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: (response) => {
                    console.log(
                        'Servicio registrado:',
                        response.data,
                    );

                    this.router.navigate([
                        '/admin/servicios',
                    ]);
                },
                error: (error) => {
                    console.error(
                        'Error registrando servicio:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ||
                            'No se pudo registrar el servicio.',
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