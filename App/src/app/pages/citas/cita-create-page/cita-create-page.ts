import {
    Component,
    computed,
    effect,
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
     * =====================================================
     * SESIÓN
     * =====================================================
     */

    readonly usuarioAutenticado =
        this.authService.usuario;

    readonly rol =
        this.authService.rol;

    readonly sesionInicializada =
        this.authService.sesionInicializada;

    readonly esCliente =
        computed(
            () =>
                this.rol() ===
                Role.USER,
        );

    readonly esAdmin =
        computed(
            () =>
                this.rol() ===
                Role.ADMIN,
        );

    /*
     * Para USER devuelve el ID del usuario
     * autenticado.
     *
     * Para ADMIN devuelve null porque
     * el administrador selecciona cliente.
     */
    readonly clienteAutenticadoId =
        computed<number | null>(() => {

            if (!this.esCliente()) {
                return null;
            }

            const usuario =
                this.usuarioAutenticado();

            return (
                usuario?.id ??
                null
            );
        });

    /*
     * Evita cargar dos veces los datos
     * cuando cambian los signals de sesión.
     */
    private readonly datosCargados =
        signal(false);

    /*
     * Esperamos a que AuthService termine
     * de restaurar la sesión antes de
     * preparar el formulario.
     */
    private readonly cargarDatosEffect =
        effect(() => {

            const sesionInicializada =
                this.sesionInicializada();

            if (!sesionInicializada) {
                return;
            }

            if (this.datosCargados()) {
                return;
            }

            const rol =
                this.rol();

            const usuario =
                this.usuarioAutenticado();

            /*
             * Si es cliente necesitamos
             * obligatoriamente su perfil.
             */
            if (
                rol === Role.USER &&
                !usuario
            ) {
                this.loading.set(false);

                this.error.set(
                    'No se pudo identificar al cliente autenticado.',
                );

                return;
            }

            /*
             * Solo ADMIN y USER pueden
             * utilizar esta página.
             */
            if (
                rol !== Role.USER &&
                rol !== Role.ADMIN
            ) {
                this.loading.set(false);

                this.error.set(
                    'El usuario actual no puede registrar citas.',
                );

                return;
            }

            this.datosCargados.set(
                true,
            );

            this.cargarDatosFormulario();
        });

    /*
     * =====================================================
     * DATOS
     * =====================================================
     */

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

    /*
     * =====================================================
     * CARGA PRINCIPAL
     * =====================================================
     */

    cargarDatosFormulario(): void {

        this.loading.set(true);
        this.error.set(null);

        if (this.esAdmin()) {
            this.cargarDatosAdministrador();

            return;
        }

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
     * =====================================================
     * ADMIN
     * =====================================================
     */

    private cargarDatosAdministrador(): void {

        forkJoin({
            usuarios:
                this.usuarioService
                    .listar(),

            profesionales:
                this.perfilProfesionalService
                    .listar(),

            servicios:
                this.servicioService
                    .listar(),
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

                    const clientes =
                        this.obtenerLista<Usuario>(
                            usuarios.data,
                        ).filter(
                            (usuario) =>
                                usuario.role ===
                                    Role.USER &&
                                usuario.estado,
                        );

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
     * =====================================================
     * CLIENTE
     * =====================================================
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
         * Para el cliente solamente existe
         * una opción válida: él mismo.
         */
        this.clientes.set([
            usuario,
        ]);

        forkJoin({
            profesionales:
                this.perfilProfesionalService
                    .listar(),

            servicios:
                this.servicioService
                    .listar(),
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

    /*
     * =====================================================
     * GUARDAR
     * =====================================================
     */

    guardar(
        data:
            | CitaCreateDto
            | CitaUpdateDto,
    ): void {

        /*
         * Evita doble envío.
         */
        if (this.saving()) {
            return;
        }

        this.error.set(null);

        const dataCrear =
            data as CitaCreateDto;

        let cita:
            CitaCreateDto;

        /*
         * CLIENTE:
         * reemplazamos siempre clienteId
         * con el usuario autenticado.
         *
         * Aunque el formulario enviara otro
         * ID, aquí no lo aceptaríamos.
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

            if (
                !dataCrear.clienteId
            ) {
                this.error.set(
                    'Debe seleccionar un cliente.',
                );

                return;
            }

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
                     * Cliente vuelve a su
                     * historial.
                     */
                    if (this.esCliente()) {

                        void this.router.navigate([
                            '/mis-citas',
                        ]);

                        return;
                    }

                    /*
                     * Admin vuelve al listado
                     * administrativo.
                     */
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

    /*
     * =====================================================
     * CANCELAR
     * =====================================================
     */

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

    /*
     * =====================================================
     * UTILIDADES
     * =====================================================
     */

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