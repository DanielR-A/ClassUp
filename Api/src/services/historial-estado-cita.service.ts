import { prisma } from "../config/prisma";

export const historialEstadoCitaService = {
    async listar(page: number = 1, limit: number = 0) {
        // Si limit es 0, se devuelven todos los registros.
        const paginar = limit > 0;

        const skip = paginar ? (page - 1) * limit : undefined;
        const take = paginar ? limit : undefined;

        const [totalItems, data] = await Promise.all([
            prisma.historialEstadoCita.count(),

            prisma.historialEstadoCita.findMany({
                skip,
                take,

                include: {
                    cita: {
                        select: {
                            id: true,
                            fechaCita: true,
                            horaInicio: true,
                            horaFinalizacion: true,
                            modalidad: true,
                            estado: true,

                            cliente: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellidos: true,
                                },
                            },

                            profesional: {
                                select: {
                                    id: true,
                                    tituloProfesional: true,
                                },
                            },

                            servicio: {
                                select: {
                                    id: true,
                                    nombre: true,
                                },
                            },
                        },
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        const totalPages = paginar
            ? Math.ceil(totalItems / limit)
            : 1;

        return {
            meta: {
                totalItems,
                totalPages,
                currentPage: paginar ? page : 1,
                limit: paginar ? limit : totalItems,
            },
            data,
        };
    },

    async obtenerPorId(id: number) {
        return await prisma.historialEstadoCita.findUnique({
            where: {
                id,
            },

            include: {
                cita: {
                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                correo: true,
                            },
                        },

                        profesional: {
                            include: {
                                usuario: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        apellidos: true,
                                        correo: true,
                                    },
                                },
                            },
                        },

                        servicio: {
                            include: {
                                categoria: true,
                                especialidades: true,
                            },
                        },
                    },
                },
            },
        });
    },
};