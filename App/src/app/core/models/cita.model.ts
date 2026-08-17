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

export type ModalidadCita = 'VIRTUAL' | 'PRESENCIAL';

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

export interface CitaCreateDto {
    clienteId: number;
    profesionalId: number;
    servicioId: number;
    fechaCita: string;
    horaInicio: string;
    horaFinalizacion: string;
    modalidad: ModalidadCita;
    comentarioCliente?: string | null;
    montoEstimado: number;
}

export interface CitaUpdateDto {
    fechaCita?: string;
    horaInicio?: string;
    horaFinalizacion?: string;
    modalidad?: ModalidadCita;
    estado?: EstadoCita;
    comentarioCliente?: string | null;
    comentarioProfesional?: string | null;
    montoEstimado?: number;
}