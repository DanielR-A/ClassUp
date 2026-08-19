import { prisma } from "../config/prisma";

import {
    CreatePerfilProfesionalDto,
    UpdatePerfilProfesionalDto,
} from "../dtos/perfil-profesional.dto";

import { AppError } from "../utils/app-error";

export const perfilProfesionalService = {
    async listar(
        page: number = 1,
        limit: number = 0,
    ) {
        const paginar = limit > 0;

        const skip = paginar
            ? (page - 1) * limit
            : undefined;

        const take = paginar
            ? limit
            : undefined;

        const [totalItems, data] = await Promise.all([
            prisma.perfilProfesional.count(),

            prisma.perfilProfesional.findMany({
                skip,
                take,

                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidos: true,
                            email: true,
                            telefono: true,
                            role: true,
                            estado: true,
                        },
                    },

                    especialidades: true,

                    servicios: {
                        select: {
                            id: true,
                            nombre: true,
                            precio: true,
                            modalidad: true,
                            estado: true,
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
        return prisma.perfilProfesional.findUnique({
            where: {
                id,
            },

            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        email: true,
                        telefono: true,
                        role: true,
                        estado: true,
                    },
                },

                especialidades: true,

                servicios: {
                    include: {
                        categoria: true,
                        especialidades: true,
                    },

                    orderBy: {
                        createdAt: "desc",
                    },
                },

                citas: {
                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,
                            },
                        },

                        servicio: {
                            select: {
                                id: true,
                                nombre: true,
                                precio: true,
                            },
                        },
                    },

                    orderBy: {
                        fechaCita: "desc",
                    },
                },

                resenas: {
                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
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

    async crear(
        data: CreatePerfilProfesionalDto,
    ) {
        await this.validarUsuario(data.usuarioId);

        await this.validarUsuarioSinPerfil(
            data.usuarioId,
        );

        if (data.especialidadIds?.length) {
            await this.validarEspecialidades(
                data.especialidadIds,
            );
        }

        return prisma.$transaction(async (tx) => {
            await tx.usuario.update({
                where: {
                    id: data.usuarioId,
                },

                data: {
                    role: "PROFESIONAL",
                },
            });

            return tx.perfilProfesional.create({
                data: {
                    usuarioId: data.usuarioId,

                    tituloProfesional:
                        data.tituloProfesional,

                    descripcion:
                        data.descripcion,

                    annosExperiencia:
                        data.annosExperiencia,

                    modalidad:
                        data.modalidad,

                    provincia:
                        data.provincia,

                    canton:
                        data.canton,

                    distrito:
                        data.distrito,

                    tarifaBase:
                        data.tarifaBase,

                    disponible:
                        data.disponible ?? true,

                    imagenPerfil:
                        data.imagenPerfil ??
                        "profile-not-found.jpg",

                    especialidades:
                        data.especialidadIds?.length
                            ? {
                                connect:
                                    data.especialidadIds.map(
                                        (id) => ({
                                            id,
                                        }),
                                    ),
                            }
                            : undefined,
                },

                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidos: true,
                            email: true,
                            telefono: true,
                            role: true,
                            estado: true,
                        },
                    },

                    especialidades: true,
                },
            });
        });
    },

    async actualizar(
        id: number,
        data: UpdatePerfilProfesionalDto,
    ) {
        const perfilActual =
            await this.obtenerPorId(id);

        if (!perfilActual) {
            throw AppError.notFound(
                "El perfil profesional indicado no existe",
            );
        }

        if (data.especialidadIds !== undefined) {
            await this.validarEspecialidades(
                data.especialidadIds,
            );
        }

        return prisma.perfilProfesional.update({
            where: {
                id,
            },

            data: {
                tituloProfesional:
                    data.tituloProfesional,

                descripcion:
                    data.descripcion,

                annosExperiencia:
                    data.annosExperiencia,

                modalidad:
                    data.modalidad,

                provincia:
                    data.provincia,

                canton:
                    data.canton,

                distrito:
                    data.distrito,

                tarifaBase:
                    data.tarifaBase,

                disponible:
                    data.disponible,

                imagenPerfil:
                    data.imagenPerfil,

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
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        email: true,
                        telefono: true,
                        role: true,
                        estado: true,
                    },
                },

                especialidades: true,
            },
        });
    },

    // true  = acepta nuevas citas
    // false = no acepta nuevas citas
    async cambiarDisponibilidad(
        id: number,
        disponible: boolean,
    ) {
        const perfilActual =
            await prisma.perfilProfesional.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                },
            });

        if (!perfilActual) {
            throw AppError.notFound(
                "El perfil profesional indicado no existe",
            );
        }

        return prisma.perfilProfesional.update({
            where: {
                id,
            },

            data: {
                disponible,
            },

            select: {
                id: true,
                tituloProfesional: true,
                disponible: true,
                updatedAt: true,

                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                    },
                },
            },
        });
    },

    async validarUsuario(
        usuarioId: number,
    ) {
        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId,
                },
            });

        if (!usuario) {
            throw AppError.badRequest(
                "El usuario indicado no existe",
            );
        }

        if (!usuario.estado) {
            throw AppError.badRequest(
                "El usuario indicado está inactivo",
            );
        }
    },

    async validarUsuarioSinPerfil(
        usuarioId: number,
    ) {
        const perfilExistente =
            await prisma.perfilProfesional.findUnique({
                where: {
                    usuarioId,
                },
            });

        if (perfilExistente) {
            throw AppError.badRequest(
                "El usuario indicado ya tiene un perfil profesional",
            );
        }
    },

    async validarEspecialidades(
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

                    estado: true,
                },
            });

        if (
            cantidad !==
            idsSinDuplicados.length
        ) {
            throw AppError.badRequest(
                "Una o más especialidades no existen o están inactivas",
            );
        }
    },
};