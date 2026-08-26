import { z } from "zod";

/*
 * =====================================================
 * CREAR CITA
 * =====================================================
 */
export const createCitaSchema = z.object({
    clienteId: z
        .number({
            message:
                "El cliente debe ser numérico",
        })
        .int()
        .positive(
            "El cliente es obligatorio",
        ),

    profesionalId: z
        .number({
            message:
                "El profesional debe ser numérico",
        })
        .int()
        .positive(
            "El profesional es obligatorio",
        ),

    servicioId: z
        .number({
            message:
                "El servicio debe ser numérico",
        })
        .int()
        .positive(
            "El servicio es obligatorio",
        ),

    /*
     * La fecha llega desde Angular
     * en formato YYYY-MM-DD.
     */
    fechaCita: z.coerce.date(),

    /*
     * Angular envía la hora como HH:mm.
     *
     * Ejemplo:
     * "09:30"
     *
     * Se transforma a Date porque Prisma
     * utiliza DateTime.
     */
    horaInicio: z
        .string()
        .regex(
            /^([01]\d|2[0-3]):[0-5]\d$/,
            "La hora de inicio debe tener formato HH:mm",
        )
        .transform(
            (hora) =>
                new Date(
                    `1970-01-01T${hora}:00`,
                ),
        ),

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

    /*
     * Descripción de la necesidad.
     */
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


/*
 * =====================================================
 * ACTUALIZAR CITA
 * =====================================================
 */
export const updateCitaSchema =
    createCitaSchema.partial();


/*
 * =====================================================
 * RECHAZAR CITA
 * =====================================================
 */
export const rechazarCitaSchema =
    z.object({
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


/*
 * =====================================================
 * CANCELAR CITA
 * =====================================================
 */
export const cancelarCitaSchema =
    z.object({
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


/*
 * =====================================================
 * TIPOS
 * =====================================================
 */

export type CreateCitaDto =
    z.infer<
        typeof createCitaSchema
    >;

export type UpdateCitaDto =
    z.infer<
        typeof updateCitaSchema
    >;

export type RechazarCitaDto =
    z.infer<
        typeof rechazarCitaSchema
    >;

export type CancelarCitaDto =
    z.infer<
        typeof cancelarCitaSchema
    >;