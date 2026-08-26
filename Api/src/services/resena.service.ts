import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

export const resenaService = {

    async listar(
        page: number = 1,
        limit: number = 0,
    ) {

        const paginar =
            limit > 0;

        const skip =
            paginar
                ? (page - 1) * limit
                : undefined;

        const take =
            paginar
                ? limit
                : undefined;

        const [
            totalItems,
            data,
        ] = await Promise.all([

            prisma.resena.count(),

            prisma.resena.findMany({
                skip,
                take,

                include: {

                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidos: true,
                        },
                    },

                    profesional: {
                        include: {
                            usuario: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellidos: true,
                                },
                            },
                        },
                    },

                    cita: {
                        include: {
                            servicio: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        const totalPages =
            paginar
                ? Math.ceil(
                      totalItems / limit,
                  )
                : 1;

        return {
            meta: {
                totalItems,
                totalPages,
                currentPage:
                    paginar
                        ? page
                        : 1,
                limit:
                    paginar
                        ? limit
                        : totalItems,
            },

            data,
        };
    },


    async obtenerPorId(
        id: number,
    ) {

        return prisma.resena.findUnique({
            where: {
                id,
            },

            include: {

                cliente: true,

                profesional: {
                    include: {
                        usuario: true,
                    },
                },

                cita: {
                    include: {
                        servicio: true,
                    },
                },
            },
        });
    },


    async crear(
        citaId: number,
        usuarioId: number,
        puntuacion: number,
        comentario?: string,
    ) {

        /*
         * 1. Buscar cita.
         */
        const cita =
            await prisma.cita.findUnique({
                where: {
                    id: citaId,
                },

                include: {
                    resena: true,

                    servicio: true,

                    profesional: {
                        include: {
                            usuario: true,
                        },
                    },
                },
            });

        if (!cita) {
            throw AppError.notFound(
                "La cita indicada no existe",
            );
        }

        /*
         * 2. Solo el cliente dueño
         * de la cita puede reseñarla.
         */
        if (
            cita.clienteId !==
            usuarioId
        ) {
            throw AppError.badRequest(
                "No tiene permiso para reseñar esta cita",
            );
        }

        /*
         * 3. Solo citas completadas.
         */
        if (
            cita.estado !==
            "COMPLETADA"
        ) {
            throw AppError.badRequest(
                "Solo se pueden reseñar citas completadas",
            );
        }

        /*
         * 4. Una sola reseña por cita.
         */
        if (cita.resena) {
            throw AppError.badRequest(
                "Esta cita ya tiene una reseña registrada",
            );
        }

        /*
         * 5. Puntuación entera de 1 a 5.
         */
        if (
            !Number.isInteger(
                puntuacion,
            ) ||
            puntuacion < 1 ||
            puntuacion > 5
        ) {
            throw AppError.badRequest(
                "La puntuación debe ser un número entero entre 1 y 5",
            );
        }

        /*
         * 6. Crear reseña.
         *
         * clienteId y profesionalId
         * salen de la sesión y la cita,
         * no del frontend.
         */
        return prisma.resena.create({
            data: {

                citaId:
                    cita.id,

                clienteId:
                    usuarioId,

                profesionalId:
                    cita.profesionalId,

                puntuacion,

                comentario:
                    comentario
                        ?.trim() ||
                    null,
            },

            include: {

                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                    },
                },

                profesional: {
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                            },
                        },
                    },
                },

                cita: {
                    include: {
                        servicio: true,
                    },
                },
            },
        });
    },


    async promedioProfesional(
        profesionalId: number,
    ) {

        const resultado =
            await prisma.resena.aggregate({
                where: {
                    profesionalId,
                },

                _avg: {
                    puntuacion: true,
                },

                _count: {
                    puntuacion: true,
                },
            });

        return {
            promedio:
                resultado._avg
                    .puntuacion ??
                0,

            totalResenas:
                resultado._count
                    .puntuacion,
        };
    },
};