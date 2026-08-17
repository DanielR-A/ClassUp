import { z } from "zod";

export const createEspecialidadSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede superar 100 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(5, "La descripción debe tener al menos 5 caracteres")
        .max(255, "La descripción no puede superar 255 caracteres")
        .optional(),
});

export const updateEspecialidadSchema =
    createEspecialidadSchema.partial();

// Valida el cambio de estado de una especialidad.
export const cambiarEstadoEspecialidadSchema = z.object({
    estado: z.boolean({
        message: "El estado debe ser true o false",
    }),
});

export type CreateEspecialidadDto = z.infer<
    typeof createEspecialidadSchema
>;

export type UpdateEspecialidadDto = z.infer<
    typeof updateEspecialidadSchema
>;

export type CambiarEstadoEspecialidadDto = z.infer<
    typeof cambiarEstadoEspecialidadSchema
>;