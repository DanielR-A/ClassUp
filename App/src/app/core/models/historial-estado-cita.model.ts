import { Cita, EstadoCita } from './cita.model';

export interface HistorialEstadoCita {
    id: number;

    citaId: number;
    cita?: Cita;

    estadoAnterior?: EstadoCita | null;
    estadoNuevo: EstadoCita;

    comentario?: string | null;
    cambiadoPorId?: number | null;

    createdAt: string;
}

export interface HistorialEstadoCitaCreateDto {
    citaId: number;
    estadoAnterior?: EstadoCita | null;
    estadoNuevo: EstadoCita;
    comentario?: string | null;
    cambiadoPorId?: number | null;
}

export interface HistorialEstadoCitaUpdateDto {
    estadoAnterior?: EstadoCita | null;
    estadoNuevo?: EstadoCita;
    comentario?: string | null;
    cambiadoPorId?: number | null;
}