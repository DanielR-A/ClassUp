import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { ProfesionalForm } from '../../../shared/components/profesional-form/profesional-form';

import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { UsuarioService } from '../../../core/services/usuario.service';

import {
    PerfilProfesional,
    PerfilProfesionalCreateDto,
    PerfilProfesionalUpdateDto,
} from '../../../core/models/perfil-profesional.model';

import { Especialidad } from '../../../core/models/especialidad.model';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
    selector: 'app-profesional-edit-page',
    standalone: true,
    imports: [ProfesionalForm],
    templateUrl: './profesional-edit-page.html',
})
export class ProfesionalEditPage {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly profesionalService = inject(
        PerfilProfesionalService,
    );

    private readonly especialidadService = inject(
        EspecialidadService,
    );

    private readonly usuarioService = inject(
        UsuarioService,
    );

    profesional = signal<PerfilProfesional | null>(null);

    usuarios = signal<Usuario[]>([]);
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
                'El identificador del profesional no es válido.',
            );

            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        forkJoin({
            profesional:
                this.profesionalService.obtenerPorId(
                    this.id,
                ),

            usuarios:
                this.usuarioService.listar(),

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
                    profesional,
                    usuarios,
                    especialidades,
                }) => {
                    this.profesional.set(
                        profesional.data,
                    );

                    this.usuarios.set(
                        this.obtenerLista<Usuario>(
                            usuarios.data,
                        ),
                    );

                    this.especialidades.set(
                        this.obtenerLista<Especialidad>(
                            especialidades.data,
                        ),
                    );

                    console.log(
                        'Profesional cargado:',
                        profesional.data,
                    );
                },
                error: (error) => {
                    console.error(
                        'Error cargando datos del profesional:',
                        error,
                    );

                    this.error.set(
                        'No se pudo cargar la información del profesional.',
                    );
                },
            });
    }

    guardar(
        data:
            | PerfilProfesionalCreateDto
            | PerfilProfesionalUpdateDto,
    ): void {
        if (!this.id || Number.isNaN(this.id)) {
            return;
        }

        this.saving.set(true);
        this.error.set(null);

        const profesionalData =
            data as PerfilProfesionalUpdateDto;

        console.log(
            'Datos para actualizar profesional:',
            profesionalData,
        );

        this.profesionalService
            .actualizar(
                this.id,
                profesionalData,
            )
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: (response) => {
                    console.log(
                        'Profesional actualizado:',
                        response.data,
                    );

                    this.router.navigate([
                        '/admin/profesionales',
                    ]);
                },
                error: (error) => {
                    console.error(
                        'Error actualizando profesional:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ||
                            'No se pudo actualizar el profesional.',
                    );
                },
            });
    }

    cancelar(): void {
        this.router.navigate([
            '/admin/profesionales',
        ]);
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