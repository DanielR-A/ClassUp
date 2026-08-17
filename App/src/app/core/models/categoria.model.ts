import { Servicio } from './servicio.model';

export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string | null;

        // true = categoría activa
    // false = categoría inactiva
    estado: boolean;

    servicios?: Servicio[];

    createdAt: string;
    updatedAt: string;
}

export interface CategoriaCreateDto {
    nombre: string;
    descripcion?: string | null;

}

export interface CategoriaUpdateDto {
    nombre?: string;
    descripcion?: string | null;
}

/**
 * DTO para activar o desactivar una categoría.
 */
export interface CambiarEstadoCategoriaDto {
    estado: boolean;
}