// Este archivo corresponde al DTO 
// (Data Transfer Object) y las validaciones 
// de la entidad Categoría utilizando Zod. 
// Su objetivo es validar que los datos 
// enviados por el cliente sean correctos 
// antes de llegar al service o a la base de 
// datos.
import { z } from "zod";

// ==========================================================
// ESQUEMA PARA CREAR UNA CATEGORÍA
// ==========================================================
// Define las reglas que deben cumplir los datos enviados
// al crear una nueva categoría.
export const createCategoriaSchema = z.object({

    // El nombre:
    // - Debe ser un texto.
    // - Elimina espacios al inicio y al final.
    // - Debe tener entre 3 y 100 caracteres.
    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede superar 100 caracteres"),

    // La descripción:
    // - Debe ser un texto.
    // - Elimina espacios.
    // - Debe tener entre 5 y 255 caracteres.
    // - Es opcional.
    descripcion: z
        .string()
        .trim()
        .min(5, "La descripción debe tener al menos 5 caracteres")
        .max(255, "La descripción no puede superar 255 caracteres")
        .optional(),
});

// ==========================================================
// ESQUEMA PARA ACTUALIZAR UNA CATEGORÍA
// ==========================================================
// partial() convierte todos los campos en opcionales.
// Así el usuario puede actualizar únicamente los datos
// que desee modificar.
export const updateCategoriaSchema =
    createCategoriaSchema.partial();

// ==========================================================
// ESQUEMA PARA CAMBIAR EL ESTADO
// ==========================================================
// Valida que únicamente se reciba un valor booleano.
export const cambiarEstadoCategoriaSchema = z.object({

    estado: z.boolean({
        message: "El estado debe ser true o false",
    }),

});

// ==========================================================
// TIPOS DE TYPESCRIPT
// ==========================================================
// A partir de cada esquema, Zod genera automáticamente
// un tipo para utilizarlo en los controllers y services.

// Tipo para crear una categoría
export type CreateCategoriaDto = z.infer<
    typeof createCategoriaSchema
>;

// Tipo para actualizar una categoría
export type UpdateCategoriaDto = z.infer<
    typeof updateCategoriaSchema
>;

// Tipo para cambiar el estado
export type CambiarEstadoCategoriaDto = z.infer<
    typeof cambiarEstadoCategoriaSchema
>;