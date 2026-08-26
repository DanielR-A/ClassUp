import { HistorialEstadoCita } from './historial-estado-cita.model';
import { PerfilProfesional } from './perfil-profesional.model';
import { Resena } from './resena.model';
import { Servicio } from './servicio.model';
import { Usuario } from './usuario.model';

export type EstadoCita =
    | 'PENDIENTE'
    | 'ACEPTADA'
    | 'RECHAZADA'
    | 'CANCELADA'
    | 'COMPLETADA';

export type ModalidadCita =
    | 'VIRTUAL'
    | 'PRESENCIAL';

export interface Cita {
    id: number;

    fechaCita: string;
    horaInicio: string;
    horaFinalizacion: string;

    modalidad: ModalidadCita;
    estado: EstadoCita;

    comentarioCliente?: string | null;
    comentarioProfesional?: string | null;

    // Prisma Decimal puede llegar como string o number.
    montoEstimado: number | string;

    clienteId: number;
    cliente?: Usuario;

    profesionalId: number;
    profesional?: PerfilProfesional;

    servicioId: number;
    servicio?: Servicio;

    historial?: HistorialEstadoCita[];
    resena?: Resena | null;

    createdAt: string;
    updatedAt: string;
}

/*
 * Modelo interno del formulario.
 *
 * horaFinalizacion y montoEstimado
 * se conservan porque Angular puede
 * calcularlos y mostrarlos antes de guardar.
 */
export interface CitaFormModel {
    clienteId: number | null;
    profesionalId: number | null;
    servicioId: number | null;

    fechaCita: string;
    horaInicio: string;

    horaFinalizacion: string;

    modalidad: ModalidadCita;

    comentarioCliente: string;

    montoEstimado: number;
}

/*
 * Datos enviados al API para crear una cita.
 *
 * El API calcula automáticamente:
 * - horaFinalizacion
 * - montoEstimado
 * - estado PENDIENTE
 */
export interface CitaCreateDto {
    clienteId: number;
    profesionalId: number;
    servicioId: number;

    fechaCita: string;
    horaInicio: string;

    modalidad: ModalidadCita;

    comentarioCliente?: string | null;
}

/*
 * Datos permitidos para actualizar
 * información general de la cita.
 *
 * Los estados se cambian mediante
 * endpoints específicos.
 */
export interface CitaUpdateDto {
    clienteId?: number;
    profesionalId?: number;
    servicioId?: number;

    fechaCita?: string;
    horaInicio?: string;

    modalidad?: ModalidadCita;

    comentarioCliente?: string | null;
}