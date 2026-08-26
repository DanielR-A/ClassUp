import { z } from "zod";

export const createResenaSchema = z.object({
    citaId: z
        .number({
            message:
                "La cita debe ser numérica",
        })
        .int()
        .positive(
            "La cita es obligatoria",
        ),

    puntuacion: z
        .number({
            message:
                "La puntuación debe ser numérica",
        })
        .int(
            "La puntuación debe ser un número entero",
        )
        .min(
            1,
            "La puntuación mínima es 1",
        )
        .max(
            5,
            "La puntuación máxima es 5",
        ),

    comentario: z
        .string()
        .trim()
        .max(
            500,
            "El comentario no puede superar 500 caracteres",
        )
        .optional(),
});

export const updateResenaSchema =
    createResenaSchema.partial();

export type CreateResenaDto =
    z.infer<
        typeof createResenaSchema
    >;

export type UpdateResenaDto =
    z.infer<
        typeof updateResenaSchema
    >;