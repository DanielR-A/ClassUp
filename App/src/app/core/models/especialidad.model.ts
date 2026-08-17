import { PerfilProfesional } from './perfil-profesional.model';
import { Servicio } from './servicio.model';

export interface Especialidad {
    id: number;
    nombre: string;
    descripcion?: string | null;

    // true = especialidad activa
    // false = especialidad inactiva
    estado: boolean;

    profesionales?: PerfilProfesional[];
    servicios?: Servicio[];

    createdAt: string;
    updatedAt: string;
}

export interface EspecialidadCreateDto {
    nombre: string;
    descripcion?: string | null;

    // Prisma utiliza @default(true) opcionalll
    estado?: boolean;
}

export interface EspecialidadUpdateDto {
    nombre?: string;
    descripcion?: string | null;
}

/**
 * DTO para activar o desactivar una especialidad.
 */
export interface CambiarEstadoEspecialidadDto {
    estado: boolean;
}