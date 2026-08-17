import { z } from "zod";

export const createServicioSchema = z.object({
    profesionalId: z
        .number({
            message: "El profesional debe ser numérico",
        })
        .int()
        .positive("El profesional es obligatorio"),

    categoriaId: z
        .number({
            message: "La categoría debe ser numérica",
        })
        .int()
        .positive("La categoría es obligatoria"),

    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(150, "El nombre no puede superar 150 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(500, "La descripción no puede superar 500 caracteres"),

    precio: z
        .number({
            message: "El precio debe ser numérico",
        })
        .positive("El precio debe ser mayor a 0"),

    duracionMinutos: z
        .number({
            message: "La duración debe ser numérica",
        })
        .int()
        .min(15, "La duración mínima es de 15 minutos"),

    modalidad: z.enum([
        "VIRTUAL",
        "PRESENCIAL",
        "MIXTA",
    ]),

    especialidadIds: z
        .array(
            z.number().int().positive(),
        )
        .optional(),
});

export const updateServicioSchema =
    createServicioSchema.partial();

/*
 * DTO específico para cambiar únicamente
 * el estado del servicio.
 */
export const cambiarEstadoServicioSchema =
    z.object({
        estado: z.boolean({
            message:
                "El estado debe ser true o false",
        }),
    });

export type CreateServicioDto = z.infer<
    typeof createServicioSchema
>;

export type UpdateServicioDto = z.infer<
    typeof updateServicioSchema
>;

export type CambiarEstadoServicioDto = z.infer<
    typeof cambiarEstadoServicioSchema
>;