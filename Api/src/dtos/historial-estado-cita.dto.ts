import { z } from "zod";

export const createHistorialEstadoCitaSchema = z.object({
    citaId: z
        .number()
        .int()
        .positive("La cita es obligatoria"),

    estadoAnterior: z
        .enum([
            "PENDIENTE",
            "ACEPTADA",
            "RECHAZADA",
            "CANCELADA",
            "COMPLETADA",
        ])
        .optional(),

    estadoNuevo: z.enum([
        "PENDIENTE",
        "ACEPTADA",
        "RECHAZADA",
        "CANCELADA",
        "COMPLETADA",
    ]),

    comentario: z
        .string()
        .trim()
        .max(500)
        .optional(),

    cambiadoPorId: z
        .number()
        .int()
        .positive()
        .optional(),
});

export const updateHistorialEstadoCitaSchema =
    createHistorialEstadoCitaSchema.partial();

export type CreateHistorialEstadoCitaDto =
    z.infer<typeof createHistorialEstadoCitaSchema>;

export type UpdateHistorialEstadoCitaDto =
    z.infer<typeof updateHistorialEstadoCitaSchema>;