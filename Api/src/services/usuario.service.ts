import { prisma } from "../config/prisma";

export const usuarioService = {
    async listar(page: number = 1, limit: number = 0) {
        // Si limit es 0, se devuelven todos los registros.
        const paginar = limit > 0;

        const skip = paginar
            ? (page - 1) * limit
            : undefined;

        const take = paginar
            ? limit
            : undefined;

        const [totalItems, data] = await Promise.all([
            prisma.usuario.count(),

            prisma.usuario.findMany({
                skip,
                take,
                select: {
                    id: true,
                    nombre: true,
                    apellidos: true,
                    correo: true,
                    telefono: true,
                    cedula: true,
                    role: true,
                    estado: true,
                    createdAt: true,
                    updatedAt: true,

                    perfilProfesional: {
                        select: {
                            id: true,
                            tituloProfesional: true,
                            disponible: true,
                            imagenPerfil: true,
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
        return await prisma.usuario.findUnique({
            where: {
                id,
            },

            select: {
                id: true,
                nombre: true,
                apellidos: true,
                correo: true,
                telefono: true,
                cedula: true,
                role: true,
                estado: true,
                createdAt: true,
                updatedAt: true,

                perfilProfesional: {
                    include: {
                        especialidades: true,

                        servicios: {
                            include: {
                                categoria: true,
                                especialidades: true,
                            },
                        },
                    },
                },

                citasCliente: {
                    include: {
                        servicio: {
                            select: {
                                id: true,
                                nombre: true,
                                precio: true,
                                duracionMinutos: true,
                            },
                        },

                        profesional: {
                            select: {
                                id: true,
                                tituloProfesional: true,
                            },
                        },
                    },

                    orderBy: {
                        fechaCita: "desc",
                    },
                },

                resenas: {
                    include: {
                        profesional: {
                            select: {
                                id: true,
                                tituloProfesional: true,
                            },
                        },
                    },

                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
    },

    // Cambia únicamente el estado del usuario.
    // true  = usuario activo
    // false = usuario inactivo
    async cambiarEstado(
        id: number,
        estado: boolean,
    ) {
        return await prisma.usuario.update({
            where: {
                id,
            },

            data: {
                estado,
            },

            select: {
                id: true,
                nombre: true,
                apellidos: true,
                correo: true,
                telefono: true,
                cedula: true,
                role: true,
                estado: true,
                updatedAt: true,
            },
        });
    },
};