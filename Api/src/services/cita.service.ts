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


    async misSolicitudes(usuarioId: number) {
        /*
         * Busca el perfil profesional asociado
         * al usuario autenticado.
         */
        const profesional =
            await prisma.perfilProfesional.findUnique({
                where: {
                    usuarioId: usuarioId,
                },
            });

        if (!profesional) {
            throw AppError.notFound(
                "El usuario autenticado no tiene un perfil profesional",
            );
        }

        /*
         * Busca únicamente las citas asignadas
         * al profesional autenticado.
         */
        return prisma.cita.findMany({
            where: {
                profesionalId: profesional.id,
            },

            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        email: true,
                        telefono: true,
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

                servicio: {
                    select: {
                        id: true,
                        nombre: true,
                        descripcion: true,
                        precio: true,
                        duracionMinutos: true,
                        modalidad: true,
                    },
                },

                historial: {
                    orderBy: {
                        createdAt: "asc",
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
        });
    },




    async aceptar(
        citaId: number,
        usuarioId: number,
    ) {
        const cita = await prisma.cita.findUnique({
            where: {
                id: citaId,
            },

            include: {
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
         * Verifica que la cita pertenezca
         * al profesional autenticado.
         */
        if (
            cita.profesional.usuario.id !== usuarioId
        ) {
            throw AppError.badRequest(
                "No tiene permiso para gestionar esta cita",
            );
        }

        /*
         * Solo las citas PENDIENTES
         * pueden aceptarse.
         */
        if (cita.estado !== "PENDIENTE") {
            throw AppError.badRequest(
                "Solo se pueden aceptar citas pendientes",
            );
        }

        return prisma.$transaction(async (tx) => {

            const citaActualizada =
                await tx.cita.update({
                    where: {
                        id: citaId,
                    },

                    data: {
                        estado: "ACEPTADA",
                    },

                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,
                                telefono: true,
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
                    citaId: citaId,

                    estadoAnterior:
                        "PENDIENTE",

                    estadoNuevo:
                        "ACEPTADA",

                    comentario:
                        "Cita aceptada por el profesional",

                    cambiadoPorId:
                        usuarioId,
                },
            });

            return citaActualizada;
        });
    },



    async rechazar(
    citaId: number,
    usuarioId: number,
    comentarioProfesional: string,
) {
    const cita = await prisma.cita.findUnique({
        where: {
            id: citaId,
        },

        include: {
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
     * Verifica que la cita pertenezca
     * al profesional autenticado.
     */
    if (
        cita.profesional.usuario.id !== usuarioId
    ) {
        throw AppError.badRequest(
            "No tiene permiso para gestionar esta cita",
        );
    }

    /*
     * Solo las citas pendientes
     * pueden rechazarse.
     */
    if (cita.estado !== "PENDIENTE") {
        throw AppError.badRequest(
            "Solo se pueden rechazar citas pendientes",
        );
    }

    /*
     * El motivo del rechazo es obligatorio.
     */
    if (
        !comentarioProfesional ||
        comentarioProfesional.trim().length < 3
    ) {
        throw AppError.badRequest(
            "Debe indicar el motivo del rechazo",
        );
    }

    return prisma.$transaction(async (tx) => {
        const citaActualizada =
            await tx.cita.update({
                where: {
                    id: citaId,
                },

                data: {
                    estado: "RECHAZADA",

                    comentarioProfesional:
                        comentarioProfesional.trim(),
                },

                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidos: true,
                            email: true,
                            telefono: true,
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
                citaId: citaId,

                estadoAnterior:
                    "PENDIENTE",

                estadoNuevo:
                    "RECHAZADA",

                comentario:
                    comentarioProfesional.trim(),

                cambiadoPorId:
                    usuarioId,
            },
        });

        return citaActualizada;
    });
},


};