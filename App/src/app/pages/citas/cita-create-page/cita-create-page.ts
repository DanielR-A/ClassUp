import {
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';

import {
    Router,
} from '@angular/router';

import {
    finalize,
    forkJoin,
} from 'rxjs';

import { CitaForm } from '../../../shared/components/cita-form/cita-form';

import { CitaService } from '../../../core/services/cita.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { AuthService } from '../../../core/services/auth.service';

import {
    Role,
    Usuario,
} from '../../../core/models/usuario.model';

import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { Servicio } from '../../../core/models/servicio.model';

import {
    CitaCreateDto,
    CitaUpdateDto,
} from '../../../core/models/cita.model';

@Component({
    selector: 'app-cita-create-page',
    standalone: true,
    imports: [
        CitaForm,
    ],
    templateUrl: './cita-create-page.html',
})
export class CitaCreatePage {

    private readonly router =
        inject(Router);

    private readonly citaService =
        inject(CitaService);

    private readonly usuarioService =
        inject(UsuarioService);

    private readonly perfilProfesionalService =
        inject(PerfilProfesionalService);

    private readonly servicioService =
        inject(ServicioService);

    private readonly authService =
        inject(AuthService);

    /*
     * Sesión actual.
     */
    readonly usuarioAutenticado =
        this.authService.usuario;

    readonly rol =
        this.authService.rol;

    readonly esCliente = computed(
        () =>
            this.rol() ===
            Role.USER,
    );

    readonly esAdmin = computed(
        () =>
            this.rol() ===
            Role.ADMIN,
    );

    /*
     * Cuando el formulario es utilizado
     * por un cliente, este será el único
     * cliente permitido.
     */
    readonly clienteAutenticadoId =
        computed(
            () =>
                this.esCliente()
                    ? this.usuarioAutenticado()?.id ??
                    null
                    : null,
        );

    clientes =
        signal<Usuario[]>([]);

    profesionales =
        signal<PerfilProfesional[]>([]);

    servicios =
        signal<Servicio[]>([]);

    loading =
        signal(true);

    saving =
        signal(false);

    error =
        signal<string | null>(null);

    constructor() {
        this.cargarDatosFormulario();
    }

    cargarDatosFormulario(): void {
        this.loading.set(true);
        this.error.set(null);

        /*
         * Para ADMIN necesitamos consultar
         * los usuarios porque puede crear
         * citas para distintos clientes.
         */
        if (this.esAdmin()) {
            this.cargarDatosAdministrador();

            return;
        }

        /*
         * Para USER no consultamos todos
         * los usuarios. Utilizamos solamente
         * el usuario autenticado.
         */
        if (this.esCliente()) {
            this.cargarDatosCliente();

            return;
        }

        this.loading.set(false);

        this.error.set(
            'El usuario actual no puede registrar citas.',
        );
    }

    /*
     * Carga del formulario administrativo.
     */
    private cargarDatosAdministrador(): void {
        forkJoin({
            usuarios:
                this.usuarioService.listar(),

            profesionales:
                this.perfilProfesionalService
                    .listar(),

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

                    /*
                     * Solamente usuarios cliente
                     * y activos.
                     */
                    const clientes =
                        this.obtenerLista<Usuario>(
                            usuarios.data,
                        ).filter(
                            (usuario) =>
                                usuario.role ===
                                Role.USER &&
                                usuario.estado,
                        );

                    /*
                     * Solamente profesionales
                     * disponibles y activos.
                     */
                    const profesionalesDisponibles =
                        this.obtenerLista<PerfilProfesional>(
                            profesionales.data,
                        ).filter(
                            (profesional) =>
                                profesional.disponible &&
                                profesional.usuario
                                    ?.estado !==
                                false,
                        );

                    /*
                     * Solamente servicios activos.
                     */
                    const serviciosActivos =
                        this.obtenerLista<Servicio>(
                            servicios.data,
                        ).filter(
                            (servicio) =>
                                servicio.estado,
                        );

                    this.clientes.set(
                        clientes,
                    );

                    this.profesionales.set(
                        profesionalesDisponibles,
                    );

                    this.servicios.set(
                        serviciosActivos,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error cargando datos del formulario:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No se pudieron cargar los datos del formulario.',
                    );
                },
            });
    }

    /*
     * Carga del formulario para el CLIENTE.
     *
     * No solicita la lista completa de usuarios.
     * El cliente se obtiene directamente
     * de AuthService.
     */
    private cargarDatosCliente(): void {
        const usuario =
            this.usuarioAutenticado();

        if (!usuario) {
            this.loading.set(false);

            this.error.set(
                'No se pudo identificar al cliente autenticado.',
            );

            return;
        }

        /*
         * El formulario solamente conocerá
         * al cliente autenticado.
         */
        this.clientes.set([
            usuario,
        ]);

        forkJoin({
            profesionales:
                this.perfilProfesionalService
                    .listar(),

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
                    profesionales,
                    servicios,
                }) => {

                    const profesionalesDisponibles =
                        this.obtenerLista<PerfilProfesional>(
                            profesionales.data,
                        ).filter(
                            (profesional) =>
                                profesional.disponible &&
                                profesional.usuario
                                    ?.estado !==
                                false,
                        );

                    const serviciosActivos =
                        this.obtenerLista<Servicio>(
                            servicios.data,
                        ).filter(
                            (servicio) =>
                                servicio.estado,
                        );

                    this.profesionales.set(
                        profesionalesDisponibles,
                    );

                    this.servicios.set(
                        serviciosActivos,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error cargando datos para solicitar cita:',
                        error,
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No se pudieron cargar los profesionales y servicios disponibles.',
                    );
                },
            });
    }

    guardar(
        data:
            | CitaCreateDto
            | CitaUpdateDto,
    ): void {

        if (this.saving()) {
            return;
        }

        this.error.set(null);

        /*
         * El componente está en modo creación,
         * por lo que convertimos el DTO recibido.
         */
        const dataCrear =
            data as CitaCreateDto;

        let cita:
            CitaCreateDto;

        /*
         * CLIENTE:
         * nunca confiamos en un clienteId
         * seleccionado manualmente.
         *
         * Siempre utilizamos el usuario
         * autenticado.
         */
        if (this.esCliente()) {
            const usuario =
                this.usuarioAutenticado();

            if (!usuario) {
                this.error.set(
                    'No se pudo identificar al cliente autenticado.',
                );

                return;
            }

            cita = {
                ...dataCrear,
                clienteId:
                    usuario.id,
            };

        } else if (this.esAdmin()) {

            cita =
                dataCrear;

        } else {

            this.error.set(
                'No tiene permisos para registrar una cita.',
            );

            return;
        }

        this.saving.set(true);

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
                next: (response) => {
                    console.log(
                        'Cita registrada:',
                        response.data,
                    );

                    /*
                     * Cada rol vuelve a su
                     * pantalla correspondiente.
                     */
                    if (this.esCliente()) {
                        void this.router.navigate([
                            '/mis-citas',
                        ]);

                        return;
                    }

                    void this.router.navigate([
                        '/admin/citas',
                    ]);
                },

                error: (error) => {
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
        if (this.esCliente()) {
            void this.router.navigate([
                '/mis-citas',
            ]);

            return;
        }

        void this.router.navigate([
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
            typeof data ===
            'object' &&
            'data' in data &&
            Array.isArray(data.data)
        ) {
            return data.data;
        }

        return [];
    }
}