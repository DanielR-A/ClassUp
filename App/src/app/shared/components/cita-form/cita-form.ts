import {
    Component,
    computed,
    effect,
    input,
    output,
    signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
    FormField,
    form,
    required,
    min,
    maxLength,
    validate,
} from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
    Cita,
    CitaCreateDto,
    CitaFormModel,
    CitaUpdateDto,
    ModalidadCita,
} from '../../../core/models/cita.model';

import { Usuario } from '../../../core/models/usuario.model';

import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';

import { Servicio } from '../../../core/models/servicio.model';

@Component({
    selector: 'app-cita-form',
    standalone: true,
    imports: [
        CommonModule,
        FormField,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './cita-form.html',
    styleUrl: './cita-form.css',
})
export class CitaForm {
    /*
     * Registro que se editará.
     * Cuando es null, el formulario funciona en modo creación.
     */
    cita = input<Cita | null>(null);

    /*
     * Datos utilizados en los selectores.
     */
    clientes = input<Usuario[]>([]);

    profesionales = input<PerfilProfesional[]>([]);

    servicios = input<Servicio[]>([]);

    /*
     * Indica si el componente padre está guardando.
     */
    saving = input<boolean>(false);

    /*
     * Eventos enviados al componente padre.
     */
    guardar = output<CitaCreateDto | CitaUpdateDto>();

    cancelar = output<void>();

    /*
     * Modalidades disponibles para la cita.
     */
    modalidades: ModalidadCita[] = [
        'VIRTUAL',
        'PRESENCIAL',
    ];

    /*
     * Estado principal del formulario.
     */
    citaModel = signal<CitaFormModel>({
        clienteId: null,
        profesionalId: null,
        servicioId: null,
        fechaCita: '',
        horaInicio: '',
        horaFinalizacion: '',
        modalidad: 'VIRTUAL',
        comentarioCliente: '',
        montoEstimado: 0,
    });

    /*
     * Formulario basado en Signals.
     */
    citaForm = form(this.citaModel, (path) => {
        /*
         * Cliente
         */
        required(path.clienteId, {
            message: 'Seleccione un cliente',
        });

        validate(path.clienteId, (ctx) => {
            const clienteId = Number(ctx.value());

            if (
                ctx.value() !== null &&
                (!Number.isInteger(clienteId) ||
                    clienteId <= 0)
            ) {
                return {
                    kind: 'clienteInvalido',
                    message:
                        'El cliente seleccionado no es válido',
                };
            }

            return undefined;
        });

        /*
         * Profesional
         */
        required(path.profesionalId, {
            message: 'Seleccione un profesional',
        });

        validate(path.profesionalId, (ctx) => {
            const profesionalId = Number(
                ctx.value(),
            );

            if (
                ctx.value() !== null &&
                (!Number.isInteger(profesionalId) ||
                    profesionalId <= 0)
            ) {
                return {
                    kind: 'profesionalInvalido',
                    message:
                        'El profesional seleccionado no es válido',
                };
            }

            return undefined;
        });

        /*
         * Servicio
         */
        required(path.servicioId, {
            message: 'Seleccione un servicio',
        });

        validate(path.servicioId, (ctx) => {
            const servicioId = Number(ctx.value());

            if (
                ctx.value() !== null &&
                (!Number.isInteger(servicioId) ||
                    servicioId <= 0)
            ) {
                return {
                    kind: 'servicioInvalido',
                    message:
                        'El servicio seleccionado no es válido',
                };
            }

            return undefined;
        });

        /*
         * Fecha
         */
        required(path.fechaCita, {
            message: 'La fecha de la cita es obligatoria',
        });

        validate(path.fechaCita, (ctx) => {
            const fecha = ctx.value();

            if (!fecha) {
                return undefined;
            }

            const fechaSeleccionada = new Date(
                `${fecha}T00:00:00`,
            );

            if (
                Number.isNaN(
                    fechaSeleccionada.getTime(),
                )
            ) {
                return {
                    kind: 'fechaInvalida',
                    message:
                        'Ingrese una fecha válida',
                };
            }

            const hoy = new Date();

            hoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada < hoy) {
                return {
                    kind: 'fechaPasada',
                    message:
                        'La fecha de la cita no puede estar en el pasado',
                };
            }

            return undefined;
        });

        /*
         * Hora de inicio
         */
        required(path.horaInicio, {
            message: 'La hora de inicio es obligatoria',
        });

        validate(path.horaInicio, (ctx) => {
            const horaInicio = ctx.value();

            if (
                horaInicio &&
                !this.esHoraValida(horaInicio)
            ) {
                return {
                    kind: 'horaInicioInvalida',
                    message:
                        'Ingrese una hora de inicio válida',
                };
            }

            return undefined;
        });

        /*
         * Hora de finalización
         */
        required(path.horaFinalizacion, {
            message:
                'La hora de finalización es obligatoria',
        });

        validate(
            path.horaFinalizacion,
            (ctx) => {
                const horaFinalizacion =
                    ctx.value();

                if (
                    horaFinalizacion &&
                    !this.esHoraValida(
                        horaFinalizacion,
                    )
                ) {
                    return {
                        kind: 'horaFinalizacionInvalida',
                        message:
                            'Ingrese una hora de finalización válida',
                    };
                }

                const horaInicio =
                    this.citaModel().horaInicio;

                if (
                    horaInicio &&
                    horaFinalizacion &&
                    this.convertirHoraAMinutos(
                        horaFinalizacion,
                    ) <=
                        this.convertirHoraAMinutos(
                            horaInicio,
                        )
                ) {
                    return {
                        kind: 'rangoHoraInvalido',
                        message:
                            'La hora de finalización debe ser posterior a la hora de inicio',
                    };
                }

                return undefined;
            },
        );

        /*
         * Modalidad
         */
        required(path.modalidad, {
            message: 'Seleccione una modalidad',
        });

        validate(path.modalidad, (ctx) => {
            const modalidad = ctx.value();

            const modalidadesValidas: ModalidadCita[] =
                ['VIRTUAL', 'PRESENCIAL'];

            if (
                !modalidadesValidas.includes(
                    modalidad,
                )
            ) {
                return {
                    kind: 'modalidadInvalida',
                    message:
                        'La modalidad seleccionada no es válida',
                };
            }

            return undefined;
        });

        /*
         * Comentario del cliente
         */
        maxLength(path.comentarioCliente, 500, {
            message:
                'El comentario no puede superar los 500 caracteres',
        });

        /*
         * Monto estimado
         */
        required(path.montoEstimado, {
            message: 'El monto estimado es obligatorio',
        });

        min(path.montoEstimado, 1, {
            message:
                'El monto estimado debe ser mayor a 0',
        });

        validate(path.montoEstimado, (ctx) => {
            const monto = Number(ctx.value());

            if (!Number.isFinite(monto)) {
                return {
                    kind: 'montoInvalido',
                    message:
                        'Ingrese un monto estimado válido',
                };
            }

            if (monto > 1000000) {
                return {
                    kind: 'montoExcesivo',
                    message:
                        'El monto estimado no puede superar ₡1 000 000',
                };
            }

            return undefined;
        });
    });

    /*
     * Servicios relacionados con el profesional seleccionado.
     */
    serviciosDisponibles = computed(() => {
        const profesionalId =
            this.citaModel().profesionalId;

        if (!profesionalId) {
            return [];
        }

        return this.servicios().filter(
            (servicio) =>
                servicio.profesionalId ===
                    Number(profesionalId) ||
                servicio.profesional?.id ===
                    Number(profesionalId),
        );
    });

    /*
     * true cuando se está editando una cita.
     */
    isEdit = computed(
        () => this.cita() !== null,
    );

    /*
     * Desactiva el botón mientras se guarda.
     */
    isSubmitting = computed(
        () => this.saving(),
    );

    constructor() {
        /*
         * Carga los datos cuando se recibe una cita
         * para editar.
         */
        effect(() => {
            const citaActual = this.cita();

            if (!citaActual) {
                this.resetForm();
                return;
            }

            this.citaModel.set({
                clienteId:
                    citaActual.clienteId ?? null,

                profesionalId:
                    citaActual.profesionalId ??
                    null,

                servicioId:
                    citaActual.servicioId ?? null,

                fechaCita:
                    this.formatearFecha(
                        citaActual.fechaCita,
                    ),

                horaInicio:
                    this.formatearHora(
                        citaActual.horaInicio,
                    ),

                horaFinalizacion:
                    this.formatearHora(
                        citaActual.horaFinalizacion,
                    ),

                modalidad:
                    citaActual.modalidad ??
                    'VIRTUAL',

                comentarioCliente:
                    citaActual.comentarioCliente ??
                    '',

                montoEstimado: Number(
                    citaActual.montoEstimado ?? 0,
                ),
            });
        });

        /*
         * Limpia el servicio cuando cambia
         * el profesional seleccionado.
         */
        effect(() => {
            const profesionalId =
                this.citaModel().profesionalId;

            const servicioId =
                this.citaModel().servicioId;

            if (!profesionalId || !servicioId) {
                return;
            }

            const servicioValido =
                this.servicios().some(
                    (servicio) =>
                        servicio.id ===
                            Number(servicioId) &&
                        (servicio.profesionalId ===
                            Number(profesionalId) ||
                            servicio.profesional?.id ===
                                Number(
                                    profesionalId,
                                )),
                );

            if (!servicioValido) {
                this.citaModel.update(
                    (value) => ({
                        ...value,
                        servicioId: null,
                        montoEstimado: 0,
                    }),
                );
            }
        });
    }

    /*
     * Limpia el formulario para crear una cita.
     */
    private resetForm(): void {
        this.citaModel.set({
            clienteId: null,
            profesionalId: null,
            servicioId: null,
            fechaCita: '',
            horaInicio: '',
            horaFinalizacion: '',
            modalidad: 'VIRTUAL',
            comentarioCliente: '',
            montoEstimado: 0,
        });
    }

    /*
     * Se ejecuta cuando se selecciona un servicio.
     * Coloca automáticamente el precio del servicio
     * como monto estimado.
     */
    seleccionarServicio(
        servicioId: number | null,
    ): void {
        const servicio = this.servicios().find(
            (item) =>
                item.id === Number(servicioId),
        );

        this.citaModel.update((value) => ({
            ...value,
            servicioId,
            montoEstimado: servicio
                ? Number(servicio.precio)
                : 0,
        }));

        this.citaForm
            .servicioId()
            .markAsTouched();

        this.citaForm
            .montoEstimado()
            .markAsTouched();
    }

    /*
     * Devuelve el nombre completo del cliente.
     */
    getNombreCliente(
        cliente: Usuario,
    ): string {
        return `${cliente.nombre ?? ''} ${
            cliente.apellidos ?? ''
        }`.trim();
    }

    /*
     * Devuelve el nombre completo del profesional.
     */
    getNombreProfesional(
        profesional: PerfilProfesional,
    ): string {
        const nombre =
            profesional.usuario?.nombre ?? '';

        const apellidos =
            profesional.usuario?.apellidos ?? '';

        return `${nombre} ${apellidos}`.trim();
    }

    /*
     * Ejecutado por el botón Guardar.
     */
    submit(): void {
        if (this.isSubmitting()) {
            return;
        }

        this.marcarCamposComoTocados();

        if (this.formularioInvalido()) {
            return;
        }

        this.emitirGuardar();
    }

    /*
     * Marca los campos para mostrar errores.
     */
    private marcarCamposComoTocados(): void {
        this.citaForm
            .clienteId()
            .markAsTouched();

        this.citaForm
            .profesionalId()
            .markAsTouched();

        this.citaForm
            .servicioId()
            .markAsTouched();

        this.citaForm
            .fechaCita()
            .markAsTouched();

        this.citaForm
            .horaInicio()
            .markAsTouched();

        this.citaForm
            .horaFinalizacion()
            .markAsTouched();

        this.citaForm
            .modalidad()
            .markAsTouched();

        this.citaForm
            .comentarioCliente()
            .markAsTouched();

        this.citaForm
            .montoEstimado()
            .markAsTouched();
    }

    /*
     * Comprueba si cualquiera de los campos
     * es inválido.
     */
    private formularioInvalido(): boolean {
        return (
            this.citaForm
                .clienteId()
                .invalid() ||
            this.citaForm
                .profesionalId()
                .invalid() ||
            this.citaForm
                .servicioId()
                .invalid() ||
            this.citaForm
                .fechaCita()
                .invalid() ||
            this.citaForm
                .horaInicio()
                .invalid() ||
            this.citaForm
                .horaFinalizacion()
                .invalid() ||
            this.citaForm
                .modalidad()
                .invalid() ||
            this.citaForm
                .comentarioCliente()
                .invalid() ||
            this.citaForm
                .montoEstimado()
                .invalid()
        );
    }

    /*
     * Construye y envía el DTO.
     */
    private emitirGuardar(): void {
        const dto = this.buildDto();

        console.log(
            'JSON de la cita enviado al API:',
            dto,
        );

        this.guardar.emit(dto);
    }

    /*
     * Convierte el formulario al formato
     * esperado por el API.
     */
    private buildDto():
        | CitaCreateDto
        | CitaUpdateDto {
        const value = this.citaModel();

        return {
            clienteId: Number(value.clienteId),

            profesionalId: Number(
                value.profesionalId,
            ),

            servicioId: Number(
                value.servicioId,
            ),

            fechaCita: value.fechaCita,

            horaInicio: value.horaInicio,

            horaFinalizacion:
                value.horaFinalizacion,

            modalidad: value.modalidad,

            comentarioCliente:
                value.comentarioCliente
                    ?.trim() || undefined,

            montoEstimado: Number(
                value.montoEstimado,
            ),
        };
    }

    /*
     * Comprueba el formato HH:mm.
     */
    private esHoraValida(
        hora: string,
    ): boolean {
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(
            hora,
        );
    }

    /*
     * Convierte una hora HH:mm a minutos.
     */
    private convertirHoraAMinutos(
        hora: string,
    ): number {
        const [horas, minutos] = hora
            .split(':')
            .map(Number);

        return horas * 60 + minutos;
    }

    /*
     * Convierte una fecha recibida del API
     * al formato yyyy-MM-dd.
     */
    private formatearFecha(
        fecha: string | Date,
    ): string {
        if (!fecha) {
            return '';
        }

        if (typeof fecha === 'string') {
            return fecha.substring(0, 10);
        }

        return fecha
            .toISOString()
            .substring(0, 10);
    }

    /*
     * Convierte una hora recibida del API
     * al formato HH:mm.
     */
    private formatearHora(
        hora: string | Date,
    ): string {
        if (!hora) {
            return '';
        }

        if (typeof hora === 'string') {
            const coincidencia =
                hora.match(
                    /(\d{2}):(\d{2})/,
                );

            return coincidencia
                ? `${coincidencia[1]}:${coincidencia[2]}`
                : '';
        }

        return `${String(
            hora.getHours(),
        ).padStart(2, '0')}:${String(
            hora.getMinutes(),
        ).padStart(2, '0')}`;
    }
}