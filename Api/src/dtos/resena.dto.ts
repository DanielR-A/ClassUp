import { z } from "zod";

export const createResenaSchema = z.object({
    citaId: z
        .number()
        .int()
        .positive("La cita es obligatoria"),

    clienteId: z
        .number()
        .int()
        .positive("El cliente es obligatorio"),

    profesionalId: z
        .number()
        .int()
        .positive("El profesional es obligatorio"),

    puntuacion: z
        .number({
            message: "La puntuación debe ser numérica",
        })
        .int()
        .min(1, "La puntuación mínima es 1")
        .max(5, "La puntuación máxima es 5"),

    comentario: z
        .string()
        .trim()
        .max(500)
        .optional(),
});

export const updateResenaSchema = createResenaSchema.partial();

export type CreateResenaDto = z.infer<typeof createResenaSchema>;
export type UpdateResenaDto = z.infer<typeof updateResenaSchema>;