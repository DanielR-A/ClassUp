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

/*
 * Modelo utilizado internamente
 * por el formulario.
 *
 * La cita se identifica automáticamente
 * cuando el cliente inicia la reseña
 * desde una cita completada.
 */
export interface ResenaFormModel {
    citaId: number | null;

    puntuacion: number;

    comentario: string;
}

/*
 * Datos enviados al API.
 *
 * clienteId y profesionalId NO se envían.
 *
 * El API los obtiene de:
 * - usuario autenticado
 * - cita seleccionada
 */
export interface ResenaCreateDto {
    citaId: number;

    puntuacion: number;

    comentario?: string | null;
}

export interface ResenaUpdateDto {
    puntuacion?: number;

    comentario?: string | null;
}