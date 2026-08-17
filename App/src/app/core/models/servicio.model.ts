import { Categoria } from './categoria.model';
import { Cita } from './cita.model';
import { Especialidad } from './especialidad.model';
import { PerfilProfesional } from './perfil-profesional.model';

export type Modalidad = 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';

export interface Servicio {
    id: number;
    nombre: string;
    descripcion: string;

    // Prisma Decimal puede llegar como string o number.
    precio: number | string;

    duracionMinutos: number;
    modalidad: Modalidad;

    estado: boolean;   

    profesionalId: number;
    profesional?: PerfilProfesional;

    categoriaId: number;
    categoria?: Categoria;

    especialidades?: Especialidad[];
    citas?: Cita[];

    createdAt: string;
    updatedAt: string;
}

export interface ServicioFormModel {
    nombre: string;
    descripcion: string;
    precio: number;
    duracionMinutos: number;
    modalidad: Modalidad;
    profesionalId: number | null;
    categoriaId: number | null;
    especialidadIds: number[];
}

export interface ServicioCreateDto {
    nombre: string;
    descripcion: string;
    precio: number;
    duracionMinutos: number;
    modalidad: Modalidad;
    profesionalId: number;
    categoriaId: number;
    especialidadIds: number[];
}

export interface ServicioUpdateDto {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    duracionMinutos?: number;
    modalidad?: Modalidad;
    profesionalId?: number;
    categoriaId?: number;
    especialidadIds?: number[];
}
export interface CambiarEstadoServicioDto {
    estado: boolean;
}