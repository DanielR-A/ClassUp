import { z } from "zod";

export const createPerfilProfesionalSchema = z.object({
    usuarioId: z
        .number({
            message: "El usuario debe ser numérico",
        })
        .int("El usuario debe ser un número entero")
        .positive("El usuario es obligatorio"),

    tituloProfesional: z
        .string()
        .trim()
        .min(
            3,
            "El título profesional debe tener al menos 3 caracteres",
        )
        .max(
            150,
            "El título profesional no puede superar 150 caracteres",
        ),

    descripcion: z
        .string()
        .trim()
        .min(
            10,
            "La descripción debe tener al menos 10 caracteres",
        )
        .max(
            500,
            "La descripción no puede superar 500 caracteres",
        ),

    annosExperiencia: z
        .number({
            message:
                "Los años de experiencia deben ser numéricos",
        })
        .int(
            "Los años de experiencia deben ser un número entero",
        )
        .min(
            0,
            "Los años de experiencia no pueden ser negativos",
        )
        .max(
            80,
            "Los años de experiencia no pueden superar 80",
        ),

    modalidad: z.enum(
        [
            "VIRTUAL",
            "PRESENCIAL",
            "MIXTA",
        ],
        {
            message:
                "La modalidad debe ser VIRTUAL, PRESENCIAL o MIXTA",
        },
    ),

    provincia: z
        .string()
        .trim()
        .min(
            2,
            "La provincia debe tener al menos 2 caracteres",
        )
        .max(
            100,
            "La provincia no puede superar 100 caracteres",
        ),

    canton: z
        .string()
        .trim()
        .min(
            2,
            "El cantón debe tener al menos 2 caracteres",
        )
        .max(
            100,
            "El cantón no puede superar 100 caracteres",
        ),

    distrito: z
        .string()
        .trim()
        .min(
            2,
            "El distrito debe tener al menos 2 caracteres",
        )
        .max(
            100,
            "El distrito no puede superar 100 caracteres",
        ),

    tarifaBase: z
        .number({
            message:
                "La tarifa base debe ser numérica",
        })
        .positive(
            "La tarifa base debe ser mayor a 0",
        ),

    // Si no se envía, Prisma utiliza @default(true).
    disponible: z
        .boolean({
            message:
                "La disponibilidad debe ser true o false",
        })
        .optional(),

    // Si no se envía, Prisma utiliza:
    // profile-not-found.jpg
    imagenPerfil: z
        .string()
        .trim()
        .min(
            1,
            "La imagen no puede estar vacía",
        )
        .max(
            255,
            "La imagen no puede superar 255 caracteres",
        )
        .optional(),

    especialidadIds: z
        .array(
            z
                .number({
                    message:
                        "El ID de cada especialidad debe ser numérico",
                })
                .int(
                    "Cada especialidad debe tener un ID entero",
                )
                .positive(
                    "Cada especialidad debe tener un ID válido",
                ),
        )
        .optional(),
});

/*
 * Para editar el perfil se excluye usuarioId.
 *
 * Esto impide cambiar el usuario propietario del perfil
 * profesional después de haberlo creado.
 */
export const updatePerfilProfesionalSchema =
    createPerfilProfesionalSchema
        .omit({
            usuarioId: true,
        })
        .partial();

/*
 * DTO específico para cambiar únicamente
 * la disponibilidad del profesional.
 */
export const cambiarDisponibilidadPerfilSchema = z.object({
    disponible: z.boolean({
        message:
            "La disponibilidad debe ser true o false",
    }),
});

export type CreatePerfilProfesionalDto = z.infer<
    typeof createPerfilProfesionalSchema
>;

export type UpdatePerfilProfesionalDto = z.infer<
    typeof updatePerfilProfesionalSchema
>;

export type CambiarDisponibilidadPerfilDto = z.infer<
    typeof cambiarDisponibilidadPerfilSchema
>;