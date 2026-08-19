import { z } from "zod";
import { Role } from "../../generated/prisma/enums";

export const createUsuarioSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede superar 100 caracteres"),

    apellidos: z
        .string()
        .trim()
        .min(2, "Los apellidos deben tener al menos 2 caracteres")
        .max(150, "Los apellidos no pueden superar 150 caracteres"),

    correo: z
        .string()
        .trim()
        .email("El correo electrónico no es válido")
        .max(150, "El correo no puede superar 150 caracteres")
        .toLowerCase(),

    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(255, "La contraseña no puede superar 255 caracteres"),

    telefono: z
        .string()
        .trim()
        .min(8, "El teléfono debe tener al menos 8 caracteres")
        .max(30, "El teléfono no puede superar 30 caracteres")
        .optional(),

    cedula: z
        .string()
        .trim()
        .regex(
            /^\d{9}$/,
            "La cédula debe contener exactamente 9 dígitos",
        )
        .optional(),

    role: z
        .enum(["ADMIN", "PROFESIONAL", "USER"], {
            message: "El rol debe ser ADMIN, PROFESIONAL o USER",
        })
        .optional(),
});

export const updateUsuarioSchema =
    createUsuarioSchema.partial();

// Valida únicamente el cambio de estado.
export const cambiarEstadoUsuarioSchema = z.object({
    estado: z.boolean({
        message: "El estado debe ser true o false",
    }),
});

export type CreateUsuarioDto = z.infer<
    typeof createUsuarioSchema
>;

export type UpdateUsuarioDto = z.infer<
    typeof updateUsuarioSchema
>;

export type CambiarEstadoUsuarioDto = z.infer<
    typeof cambiarEstadoUsuarioSchema
>;

export const registerUserSchema = z.object({
    email: z
        .email({ error: "Debe ingresar un correo válido" }) // Zod v4: API de nivel superior 'z.email()' sin encadenar .string()
        .max(100, { error: "El correo no puede superar 100 caracteres" }),
    password: z
        .string()
        .min(6, { error: "La contraseña debe tener al menos 6 caracteres" })
        .max(255, { error: "La contraseña no puede superar 255 caracteres" }),
    fullName: z
        .string()
        .trim()
        .min(3, { error: "El nombre completo debe tener al menos 3 caracteres" })
        .max(120, { error: "El nombre completo no puede superar 120 caracteres" }),
    role: z
        .enum(Role, { 
            error: "El rol proporcionado no es válido (Debe ser USER o ADMIN)"
        })
        .optional(),
});

export const loginUserSchema = z.object({
    email: z
        .email({ error: "Debe ingresar un correo válido" }),
    password: z
        .string()
        .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;