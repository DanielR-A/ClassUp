import { Servicio } from './servicio.model';
import { Especialidad } from './especialidad.model';
import { Usuario } from './usuario.model';

export type Modalidad =
    | 'VIRTUAL'
    | 'PRESENCIAL'
    | 'MIXTA';

export interface PerfilProfesional {
    id: number;

    usuarioId: number;
    usuario?: Usuario;

    tituloProfesional: string;
    descripcion: string;

    annosExperiencia: number;

    modalidad: Modalidad;

    provincia: string;
    canton: string;
    distrito: string;

    tarifaBase: number | string;

    // true = acepta nuevas citas
    // false = no acepta nuevas citas
    disponible: boolean;

    imagenPerfil: string;

    servicios?: Servicio[];
    especialidades?: Especialidad[];

    createdAt: string;
    updatedAt: string;
}

export interface PerfilProfesionalCreateDto {
    usuarioId: number;
    tituloProfesional: string;
    descripcion: string;
    annosExperiencia: number;
    modalidad: Modalidad;
    provincia: string;
    canton: string;
    distrito: string;
    tarifaBase: number;

    disponible?: boolean;
    imagenPerfil?: string;
    especialidadIds?: number[];
}

export interface PerfilProfesionalUpdateDto {
    tituloProfesional?: string;
    descripcion?: string;
    annosExperiencia?: number;
    modalidad?: Modalidad;
    provincia?: string;
    canton?: string;
    distrito?: string;
    tarifaBase?: string;

    disponible?: boolean;
    imagenPerfil?: string;
    especialidadIds?: number[];
}

/**
 * DTO para cambiar únicamente la disponibilidad.
 */
export interface CambiarDisponibilidadPerfilDto {
    disponible: boolean;
}