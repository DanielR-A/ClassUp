import { prisma } from "../config/prisma";

export const especialidadService = {
    async listar() {
        return await prisma.especialidad.findMany({
            orderBy: {
                nombre: "asc",
            },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.especialidad.findUnique({
            where: {
                id,
            },
            include: {
                profesionales: {
                    select: {
                        id: true,
                        tituloProfesional: true,
                        annosExperiencia: true,
                        modalidad: true,
                        provincia: true,
                        canton: true,
                    },
                },
                servicios: {
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




    // Cambia únicamente el estado de la especialidad.
    // true  = especialidad activa
    // false = especialidad inactiva
    async cambiarEstado(
        id: number,
        estado: boolean,
    ) {
        return await prisma.especialidad.update({
            where: {
                id,
            },

            data: {
                estado,
            },

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