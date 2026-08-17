// ste archivo corresponde al Service de la 
// entidad Categoría. Su función es contener 
// la lógica de negocio y comunicarse con la 
// base de datos utilizando Prisma.

// A diferencia del Controller, el service no 
// recibe peticiones HTTP ni devuelve 
// respuestas HTTP. Solo realiza operaciones 
// sobre la base de datos y devuelve los 
// resultados al controller.

import { prisma } from "../config/prisma";

// ==========================================================
// SERVICE DE CATEGORÍAS
// Contiene la lógica para acceder a la base de datos.
// Utiliza Prisma para realizar consultas.
// ==========================================================

export const categoriaService = {

    // ======================================================
    // LISTAR TODAS LAS CATEGORÍAS
    // ======================================================
    async listar() {

        // Busca todas las categorías y las ordena
        // alfabéticamente por nombre.
        return await prisma.categoria.findMany({

            orderBy: {
                nombre: "asc",
            },

        });
    },

    // ======================================================
    // OBTENER UNA CATEGORÍA POR ID
    // ======================================================
    async obtenerPorId(id: number) {

        // Busca una categoría utilizando su llave primaria.
        return await prisma.categoria.findUnique({

            where: {
                id,
            },

            // También obtiene los servicios relacionados
            // con esa categoría.
            include: {

                servicios: {

                    // Solo devuelve estos campos
                    // de cada servicio.
                    select: {
                        id: true,
                        nombre: true,
                        precio: true,
                        duracionMinutos: true,
                        modalidad: true,
                    },

                },

            },

        });
    },

    // ======================================================
    // CAMBIAR EL ESTADO DE UNA CATEGORÍA
    // ======================================================
    // true  = categoría activa
    // false = categoría inactiva
    async cambiarEstado(
        id: number,
        estado: boolean,
    ) {

        // Actualiza únicamente el campo "estado"
        // de la categoría indicada.
        return await prisma.categoria.update({

            // Indica cuál registro se va a modificar.
            where: {
                id,
            },

            // Datos que se actualizarán.
            data: {
                estado,
            },

            // Devuelve únicamente estos campos
            // después de actualizar.
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                estado: true,
                updatedAt: true,
            },

        });
    },
};