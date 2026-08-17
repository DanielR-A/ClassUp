import { prisma } from "../config/prisma";

export const resenaService = {

    async listar(page: number = 1, limit: number = 0) {

        const paginar = limit > 0;

        const skip = paginar ? (page - 1) * limit : undefined;
        const take = paginar ? limit : undefined;

        const [totalItems, data] = await Promise.all([

            prisma.resena.count(),

            prisma.resena.findMany({

                skip,
                take,

                include: {

                    cliente: {
                        select: {
                            nombre: true,
                            apellidos: true,
                        },
                    },

                    profesional: {
                        select: {
                            tituloProfesional: true,
                        },
                    },

                    cita: true,

                },

                orderBy: {
                    createdAt: "desc",
                },

            }),

        ]);

        const totalPages = paginar ? Math.ceil(totalItems / limit) : 1;

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

        return await prisma.resena.findUnique({

            where: { id },

            include: {

                cliente: true,
                profesional: {
                    include: {
                        usuario: true,
                    },
                },
                cita: true,

            },

        });

    },

};