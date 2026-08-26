import { z } from "zod";

export const createCitaSchema = z.object({
    clienteId: z
        .number({
            message: "El cliente debe ser numérico",
        })
        .int()
        .positive("El cliente es obligatorio"),

    profesionalId: z
        .number({
            message: "El profesional debe ser numérico",
        })
        .int()
        .positive("El profesional es obligatorio"),

    servicioId: z
        .number({
            message: "El servicio debe ser numérico",
        })
        .int()
        .positive("El servicio es obligatorio"),

    fechaCita: z.coerce.date(),

    horaInicio: z.coerce.date(),

    modalidad: z.enum(
        [
            "VIRTUAL",
            "PRESENCIAL",
        ],
        {
            message:
                "La modalidad debe ser VIRTUAL o PRESENCIAL",
        },
    ),

    comentarioCliente: z
        .string()
        .trim()
        .min(
            10,
            "La descripción de la necesidad debe tener al menos 10 caracteres",
        )
        .max(
            500,
            "El comentario no puede superar 500 caracteres",
        )
        .optional(),
});

export const updateCitaSchema =
    createCitaSchema.partial();

export const rechazarCitaSchema = z.object({
    comentarioProfesional: z
        .string()
        .trim()
        .min(
            3,
            "Debe indicar el motivo del rechazo",
        )
        .max(
            500,
            "El comentario no puede superar 500 caracteres",
        ),
});

export const cancelarCitaSchema = z.object({
    comentarioCliente: z
        .string()
        .trim()
        .min(
            3,
            "Debe indicar el motivo de la cancelación",
        )
        .max(
            500,
            "El comentario no puede superar 500 caracteres",
        ),
});

export type CreateCitaDto = z.infer<
    typeof createCitaSchema
>;

export type UpdateCitaDto = z.infer<
    typeof updateCitaSchema
>;

export type RechazarCitaDto = z.infer<
    typeof rechazarCitaSchema
>;

export type CancelarCitaDto = z.infer<
    typeof cancelarCitaSchema
>;