import { EstadoCita, Modalidad, ModalidadCita, Role } from "../../generated/prisma/enums";


export interface EnumOption {
    value: string;
    label: string;
}

// Estado de las Citas
export const EstadoCitaMap: Record<EstadoCita, string> = {
    [EstadoCita.PENDIENTE]: "Pendiente",
    [EstadoCita.ACEPTADA]: "Aceptada",
    [EstadoCita.RECHAZADA]: "Rechazada",
    [EstadoCita.CANCELADA]: "Cancelada",
    [EstadoCita.COMPLETADA]: "Completada",
};

// Roles
export const RoleMap: Record<Role, string> = {
    [Role.USER]: "Cliente",
    [Role.PROFESIONAL]: "Profesional",
    [Role.ADMIN]: "Administrador",
};

// Modalidades de Perfil y Servicio
export const ModalidadMap: Record<Modalidad, string> = {
    [Modalidad.VIRTUAL]: "Virtual",
    [Modalidad.PRESENCIAL]: "Presencial",
    [Modalidad.MIXTA]: "Mixta",
};

// Modalidades de la Cita
export const ModalidadCitaMap: Record<ModalidadCita, string> = {
    [ModalidadCita.VIRTUAL]: "Virtual",
    [ModalidadCita.PRESENCIAL]: "Presencial",
};

/**
 * Convierte un diccionario de mapas en un array de opciones
 */
export function getEnumOptions<T extends string>(
    map: Record<T, string>
): EnumOption[] {
    return Object.entries(map).map(([value, label]) => ({
        value,
        label: label as string,
    }));
}