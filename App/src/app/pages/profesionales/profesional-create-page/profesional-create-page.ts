import {
    Component,
    inject,
    signal,
} from '@angular/core';

import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ProfesionalForm } from '../../../shared/components/profesional-form/profesional-form';

import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { UsuarioService } from '../../../core/services/usuario.service';

import { Especialidad } from '../../../core/models/especialidad.model';
import { Usuario } from '../../../core/models/usuario.model';

import {
    PerfilProfesionalCreateDto,
    PerfilProfesionalUpdateDto,
} from '../../../core/models/perfil-profesional.model';

@Component({
    selector: 'app-profesional-create-page',
    standalone: true,
    imports: [ProfesionalForm],
    templateUrl: './profesional-create-page.html',
})
export class ProfesionalCreatePage {
    private readonly router = inject(Router);

    private readonly perfilProfesionalService = inject(
        PerfilProfesionalService,
    );

    private readonly especialidadService = inject(
        EspecialidadService,
    );

    private readonly usuarioService = inject(
        UsuarioService,
    );

    usuarios = signal<Usuario[]>([]);
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

        /*
         * Se cargan primero los usuarios y luego las
         * especialidades necesarias para el formulario.
         */
        this.usuarioService.listar().subscribe({
            next: (usuariosResponse) => {
                this.usuarios.set(
                    this.obtenerLista<Usuario>(
                        usuariosResponse.data,
                    ),
                );

                this.especialidadService
                    .listar()
                    .pipe(
                        finalize(() => {
                            this.loading.set(false);
                        }),
                    )
                    .subscribe({
                        next: (especialidadesResponse) => {
                            this.especialidades.set(
                                this.obtenerLista<Especialidad>(
                                    especialidadesResponse.data,
                                ),
                            );
                        },

                        error: (error) => {
                            console.error(
                                'Error cargando especialidades:',
                                error,
                            );

                            this.error.set(
                                'No se pudieron cargar las especialidades.',
                            );
                        },
                    });
            },

            error: (error) => {
                console.error(
                    'Error cargando usuarios:',
                    error,
                );

                this.error.set(
                    'No se pudieron cargar los usuarios.',
                );

                this.loading.set(false);
            },
        });
    }

    guardar(
        data:
            | PerfilProfesionalCreateDto
            | PerfilProfesionalUpdateDto,
    ): void {
        this.saving.set(true);
        this.error.set(null);

        const profesionalData =
            data as PerfilProfesionalCreateDto;

        console.log(
            'Profesional por registrar:',
            profesionalData,
        );

        this.perfilProfesionalService
            .crear(profesionalData)
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: (response) => {
                    console.log(
                        'Profesional registrado:',
                        response.data,
                    );

                    this.router.navigate([
                        '/admin/profesionales',
                    ]);
                },

                error: (error) => {
                    console.error(
                        'Error registrando profesional:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ||
                            'No se pudo registrar el profesional.',
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