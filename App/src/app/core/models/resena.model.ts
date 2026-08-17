import { Cita } from './cita.model';
import { PerfilProfesional } from './perfil-profesional.model';
import { Usuario } from './usuario.model';

export interface Resena {
    id: number;

    citaId: number;
    cita?: Cita;

    clienteId: number;
    cliente?: Usuario;

    profesionalId: number;
    profesional?: PerfilProfesional;

    puntuacion: number;
    comentario?: string | null;

    createdAt: string;
    updatedAt: string;
}

export interface ResenaFormModel {
    citaId: number | null;
    clienteId: number | null;
    profesionalId: number | null;
    puntuacion: number;
    comentario: string;
}

export interface ResenaCreateDto {
    citaId: number;
    clienteId: number;
    profesionalId: number;
    puntuacion: number;
    comentario?: string | null;
}

export interface ResenaUpdateDto {
    puntuacion?: number;
    comentario?: string | null;
}