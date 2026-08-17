import {
    Component,
    inject,
    signal,
} from '@angular/core';

import { Router } from '@angular/router';

import {
    finalize,
    forkJoin,
} from 'rxjs';

import { CitaForm } from '../../../shared/components/cita-form/cita-form';

import { CitaService } from '../../../core/services/cita.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { ServicioService } from '../../../core/services/servicio.service';

import { Usuario } from '../../../core/models/usuario.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { Servicio } from '../../../core/models/servicio.model';

import {
    CitaCreateDto,
    CitaUpdateDto,
} from '../../../core/models/cita.model';

@Component({
    selector: 'app-cita-create-page',
    standalone: true,
    imports: [CitaForm],
    templateUrl: './cita-create-page.html',
})
export class CitaCreatePage {

    private readonly router = inject(Router);

    private readonly citaService =
        inject(CitaService);

    private readonly usuarioService =
        inject(UsuarioService);

    private readonly perfilProfesionalService =
        inject(PerfilProfesionalService);

    private readonly servicioService =
        inject(ServicioService);

    clientes = signal<Usuario[]>([]);
    profesionales = signal<PerfilProfesional[]>([]);
    servicios = signal<Servicio[]>([]);

    loading = signal(true);
    saving = signal(false);
    error = signal<string |null>(null);

    constructor() {
        this.cargarDatosFormulario();
    }

    cargarDatosFormulario(): void {

        this.loading.set(true);
        this.error.set(null);

        forkJoin({

            usuarios:
                this.usuarioService.listar(),

            profesionales:
                this.perfilProfesionalService.listar(),

            servicios:
                this.servicioService.listar(),

        })
            .pipe(
                finalize(() => {
                    this.loading.set(false);
                }),
            )
            .subscribe({

                next: ({
                    usuarios,
                    profesionales,
                    servicios,
                }) => {

                    this.clientes.set(
                        this.obtenerLista<Usuario>(
                            usuarios.data,
                        ).filter(
                            usuario =>
                                usuario.role === 'USER',
                        ),
                    );

                    this.profesionales.set(
                        this.obtenerLista<PerfilProfesional>(
                            profesionales.data,
                        ),
                    );

                    this.servicios.set(
                        this.obtenerLista<Servicio>(
                            servicios.data,
                        ),
                    );

                },

                error: error => {

                    console.error(
                        'Error cargando datos:',
                        error,
                    );

                    this.error.set(
                        'No se pudieron cargar los datos del formulario.',
                    );

                },

            });

    }

    guardar(
        data: CitaCreateDto | CitaUpdateDto,
    ): void {

        this.saving.set(true);
        this.error.set(null);

        const cita =
            data as CitaCreateDto;

        console.log(
            'Cita por registrar:',
            cita,
        );

        this.citaService
            .crear(cita)
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({

                next: response => {

                    console.log(
                        'Cita registrada:',
                        response.data,
                    );

                    this.router.navigate([
                        '/admin/citas',
                    ]);

                },

                error: error => {

                    console.error(
                        'Error registrando cita:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No se pudo registrar la cita.',
                    );

                },

            });

    }

    cancelar(): void {

        this.router.navigate([
            '/admin/citas',
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