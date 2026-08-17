import { Cita } from './cita.model';
import { PerfilProfesional } from './perfil-profesional.model';
import { Resena } from './resena.model';

export type Role = 'ADMIN' | 'PROFESIONAL' | 'USER';

export interface Usuario {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono?: string | null;
    cedula?: string | null;
    role: Role;

    // true = usuario activo
    // false = usuario inactivo
    estado: boolean;

    perfilProfesional?: PerfilProfesional | null;
    citasCliente?: Cita[];
    resenas?: Resena[];

    createdAt: string;
    updatedAt: string;
}

export interface UsuarioFormModel {
    nombre: string;
    apellidos: string;
    correo: string;
    password: string;
    telefono: string;
    cedula: string;
    role: Role;
}

export interface UsuarioCreateDto {
    nombre: string;
    apellidos: string;
    correo: string;
    password: string;
    telefono?: string | null;
    cedula?: string | null;
    role?: Role;
}

export interface UsuarioUpdateDto {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    password?: string;
    telefono?: string | null;
    cedula?: string | null;
    role?: Role;
}

/**
 * DTO para activar o desactivar un usuario.
 */
export interface CambiarEstadoUsuarioDto {
    estado: boolean;
}