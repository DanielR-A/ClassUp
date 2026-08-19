import { prisma } from "../config/prisma";

import {
    CreateCitaDto,
} from "../dtos/cita.dto";

import { AppError } from "../utils/app-error";

export const citaService = {
    async listar(page: number = 1, limit: number = 0) {
        const paginar = limit > 0;

        const skip = paginar
            ? (page - 1) * limit
            : undefined;

        const take = paginar
            ? limit
            : undefined;

        const [totalItems, data] = await Promise.all([
            prisma.cita.count(),

            prisma.cita.findMany({
                skip,
                take,

                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidos: true,
                            email: true,
                            telefono: true,
                            role: true,
                        },
                    },

                    profesional: {
                        select: {
                            id: true,
                            tituloProfesional: true,
                            modalidad: true,
                            provincia: true,
                            canton: true,
                            distrito: true,

                            usuario: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellidos: true,
                                    email: true,
                                },
                            },
                        },
                    },

                    servicio: {
                        select: {
                            id: true,
                            nombre: true,
                            precio: true,
                            duracionMinutos: true,
                            modalidad: true,
                        },
                    },
                },

                orderBy: [
                    {
                        fechaCita: "desc",
                    },
                    {
                        horaInicio: "asc",
                    },
                ],
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
        return prisma.cita.findUnique({
            where: {
                id,
            },

            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        email: true,
                        telefono: true,
                        role: true,
                    },
                },

                profesional: {
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,
                                telefono: true,
                            },
                        },

                        especialidades: true,
                    },
                },

                servicio: {
                    include: {
                        categoria: true,
                        especialidades: true,
                    },
                },

                historial: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },

                resena: {
                    include: {
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
                    },
                },
            },
        });
    },

    async crear(data: CreateCitaDto) {
        const cliente =
            await prisma.usuario.findUnique({
                where: {
                    id: data.clienteId,
                },
            });

        if (!cliente) {
            throw AppError.badRequest(
                "El cliente indicado no existe",
            );
        }

        if (!cliente.estado) {
            throw AppError.badRequest(
                "El cliente indicado está inactivo",
            );
        }

        const profesional =
            await prisma.perfilProfesional.findUnique({
                where: {
                    id: data.profesionalId,
                },

                include: {
                    usuario: true,
                },
            });

        if (!profesional) {
            throw AppError.badRequest(
                "El profesional indicado no existe",
            );
        }

        if (!profesional.disponible) {
            throw AppError.badRequest(
                "El profesional no está disponible para nuevas citas",
            );
        }

        if (!profesional.usuario.estado) {
            throw AppError.badRequest(
                "El usuario del profesional está inactivo",
            );
        }

        const servicio =
            await prisma.servicio.findUnique({
                where: {
                    id: data.servicioId,
                },
            });

        if (!servicio) {
            throw AppError.badRequest(
                "El servicio indicado no existe",
            );
        }

        if (!servicio.estado) {
            throw AppError.badRequest(
                "El servicio indicado está inactivo",
            );
        }

        if (
            servicio.profesionalId !==
            data.profesionalId
        ) {
            throw AppError.badRequest(
                "El servicio no pertenece al profesional indicado",
            );
        }

        if (
            servicio.modalidad !== "MIXTA" &&
            servicio.modalidad !== data.modalidad
        ) {
            throw AppError.badRequest(
                "La modalidad seleccionada no está disponible para este servicio",
            );
        }

        return prisma.$transaction(async (tx) => {
            const cita = await tx.cita.create({
                data: {
                    clienteId: data.clienteId,
                    profesionalId:
                        data.profesionalId,
                    servicioId:
                        data.servicioId,

                    fechaCita:
                        data.fechaCita,

                    horaInicio:
                        data.horaInicio,

                    horaFinalizacion:
                        data.horaFinalizacion,

                    modalidad:
                        data.modalidad,

                    estado:
                        "PENDIENTE",

                    comentarioCliente:
                        data.comentarioCliente,

                    montoEstimado:
                        data.montoEstimado ??
                        servicio.precio,
                },

                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidos: true,
                            email: true,
                        },
                    },

                    profesional: {
                        include: {
                            usuario: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellidos: true,
                                    email: true,
                                },
                            },
                        },
                    },

                    servicio: true,
                },
            });

            await tx.historialEstadoCita.create({
                data: {
                    citaId: cita.id,
                    estadoAnterior: null,
                    estadoNuevo: "PENDIENTE",
                    comentario:
                        "Cita creada",
                    cambiadoPorId:
                        data.clienteId,
                },
            });

            return cita;
        });
    },
};