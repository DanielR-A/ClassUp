import { prisma } from "../config/prisma";

import {
    CreateServicioDto,
    UpdateServicioDto,
} from "../dtos/servicio.dto";

import { AppError } from "../utils/app-error";

export const servicioService = {
    async listar(page: number = 1, limit: number = 0) {
        const paginar = limit > 0;

        const skip = paginar
            ? (page - 1) * limit
            : undefined;

        const take = paginar
            ? limit
            : undefined;

        const [totalItems, data] = await Promise.all([
            prisma.servicio.count(),

            prisma.servicio.findMany({
                skip,
                take,

                include: {
                    categoria: true,

                    profesional: {
                        include: {
                            usuario: {
                                select: {
                                    nombre: true,
                                    apellidos: true,
                                },
                            },
                        },
                    },

                    especialidades: true,
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
        return prisma.servicio.findUnique({
            where: { id },

            include: {
                categoria: true,
                especialidades: true,

                profesional: {
                    include: {
                        usuario: true,
                    },
                },

                citas: true,
            },
        });
    },

    async crear(data: CreateServicioDto) {
        await this.validateCategoria(data.categoriaId);
        await this.validateProfesional(data.profesionalId);

        if (data.especialidadIds?.length) {
            await this.validateEspecialidades(
                data.especialidadIds,
            );
        }

        return prisma.servicio.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: data.precio,
                duracionMinutos: data.duracionMinutos,
                modalidad: data.modalidad,

                profesionalId: data.profesionalId,
                categoriaId: data.categoriaId,

                especialidades:
                    data.especialidadIds?.length
                        ? {
                            connect:
                                data.especialidadIds.map(
                                    (id) => ({ id }),
                                ),
                        }
                        : undefined,
            },

            include: {
                categoria: true,
                especialidades: true,

                profesional: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true,
                                apellidos: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    },

    async actualizar(
        id: number,
        data: UpdateServicioDto,
    ) {
        const servicioActual =
            await this.obtenerPorId(id);

        if (!servicioActual) {
            throw AppError.notFound(
                "El servicio indicado no existe",
            );
        }

        if (data.categoriaId !== undefined) {
            await this.validateCategoria(
                data.categoriaId,
            );
        }

        if (data.profesionalId !== undefined) {
            await this.validateProfesional(
                data.profesionalId,
            );
        }

        if (data.especialidadIds !== undefined) {
            await this.validateEspecialidades(
                data.especialidadIds,
            );
        }

        return prisma.servicio.update({
            where: { id },

            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: data.precio,
                duracionMinutos:
                    data.duracionMinutos,
                modalidad: data.modalidad,

                profesionalId:
                    data.profesionalId,

                categoriaId:
                    data.categoriaId,

                especialidades:
                    data.especialidadIds !== undefined
                        ? {
                            set:
                                data.especialidadIds.map(
                                    (especialidadId) => ({
                                        id: especialidadId,
                                    }),
                                ),
                        }
                        : undefined,
            },

            include: {
                categoria: true,
                especialidades: true,

                profesional: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true,
                                apellidos: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    },

    async validateCategoria(
        categoriaId: number,
    ) {
        const categoria =
            await prisma.categoria.findUnique({
                where: { id: categoriaId },
            });

        if (!categoria) {
            throw AppError.badRequest(
                "La categoría indicada no existe",
            );
        }
    },

    async validateProfesional(
        profesionalId: number,
    ) {
        const profesional =
            await prisma.perfilProfesional.findUnique({
                where: { id: profesionalId },
            });

        if (!profesional) {
            throw AppError.badRequest(
                "El profesional indicado no existe",
            );
        }
    },

    async validateEspecialidades(
        especialidadIds: number[],
    ) {
        const idsSinDuplicados = [
            ...new Set(especialidadIds),
        ];

        const cantidad =
            await prisma.especialidad.count({
                where: {
                    id: {
                        in: idsSinDuplicados,
                    },
                },
            });

        if (cantidad !== idsSinDuplicados.length) {
            throw AppError.badRequest(
                "Una o más especialidades no existen",
            );
        }
    },


// Cambia únicamente el estado del servicio.
// true  = servicio activo
// false = servicio inactivo
async cambiarEstado(
    id: number,
    estado: boolean,
) {
    const servicioActual =
        await this.obtenerPorId(id);

    if (!servicioActual) {
        throw AppError.notFound(
            "El servicio indicado no existe",
        );
    }

    return await prisma.servicio.update({
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
            precio: true,
            duracionMinutos: true,
            modalidad: true,
            estado: true,
            updatedAt: true,
        },
    });
},




};