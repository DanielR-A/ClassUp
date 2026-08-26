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
    /*
     * =====================================================
     * 1. VALIDAR CLIENTE
     * =====================================================
     */

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


    /*
     * =====================================================
     * 2. VALIDAR PROFESIONAL
     * =====================================================
     */

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


    /*
     * =====================================================
     * 3. VALIDAR SERVICIO
     * =====================================================
     */

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

    /*
     * El servicio debe pertenecer al
     * profesional seleccionado.
     */
    if (
        servicio.profesionalId !==
        data.profesionalId
    ) {
        throw AppError.badRequest(
            "El servicio no pertenece al profesional indicado",
        );
    }


    /*
     * =====================================================
     * 4. VALIDAR MODALIDAD
     * =====================================================
     *
     * MIXTA permite:
     * - VIRTUAL
     * - PRESENCIAL
     */

    if (
        servicio.modalidad !== "MIXTA" &&
        servicio.modalidad !== data.modalidad
    ) {
        throw AppError.badRequest(
            "La modalidad seleccionada no está disponible para este servicio",
        );
    }


    /*
     * =====================================================
     * 5. CONSTRUIR FECHA/HORA REAL DE INICIO
     * =====================================================
     */

    const fechaCita =
        new Date(data.fechaCita);

    const horaInicio =
        new Date(data.horaInicio);

    /*
     * inicioCita representa:
     *
     * fecha seleccionada
     * +
     * hora seleccionada
     *
     * Se utiliza para validar que la cita
     * realmente esté en el futuro.
     */
    const inicioCita =
        new Date(fechaCita);

    inicioCita.setHours(
        horaInicio.getHours(),
        horaInicio.getMinutes(),
        horaInicio.getSeconds(),
        0,
    );


    /*
     * =====================================================
     * 6. VALIDAR FECHA FUTURA
     * =====================================================
     */

    const ahora =
        new Date();

    if (inicioCita <= ahora) {
        throw AppError.badRequest(
            "La fecha y hora de la cita deben ser futuras",
        );
    }


    /*
     * =====================================================
     * 7. CALCULAR HORA FINAL
     * =====================================================
     *
     * IMPORTANTE:
     *
     * horaInicio y horaFinalizacion son
     * @db.Time en Prisma.
     *
     * Por eso utilizamos valores de hora
     * independientes de fechaCita para
     * las comparaciones de disponibilidad.
     */

    const horaInicioComparacion =
        new Date(data.horaInicio);

    const horaFinalComparacion =
        new Date(
            horaInicioComparacion,
        );

    horaFinalComparacion.setMinutes(
        horaFinalComparacion.getMinutes() +
        servicio.duracionMinutos,
    );


    /*
     * Evitar que una cita termine
     * al día siguiente.
     *
     * Ejemplo:
     * Inicio 23:30
     * duración 120 minutos
     * → terminaría 01:30 del día siguiente.
     */
    if (
        horaFinalComparacion.getDate() !==
        horaInicioComparacion.getDate()
    ) {
        throw AppError.badRequest(
            "La duración del servicio hace que la cita termine al día siguiente",
        );
    }


    /*
     * =====================================================
     * 8. DEFINIR RANGO DEL DÍA
     * =====================================================
     */

    const inicioDia =
        new Date(
            fechaCita.getFullYear(),
            fechaCita.getMonth(),
            fechaCita.getDate(),
            0,
            0,
            0,
            0,
        );

    const finDia =
        new Date(
            fechaCita.getFullYear(),
            fechaCita.getMonth(),
            fechaCita.getDate(),
            23,
            59,
            59,
            999,
        );


    /*
     * =====================================================
     * 9. VALIDAR TRASLAPES
     * =====================================================
     *
     * Bloquean horario:
     *
     * - PENDIENTE
     * - ACEPTADA
     *
     * RECHAZADA, CANCELADA y COMPLETADA
     * no bloquean nuevas solicitudes.
     *
     *
     * Existe traslape cuando:
     *
     * existenteInicio < nuevaFinal
     *
     * Y
     *
     * existenteFinal > nuevaInicio
     *
     *
     * Ejemplo:
     *
     * Existente:
     * 08:00 ---------- 09:00
     *
     * Nueva:
     *       08:30 ---------- 09:30
     *
     * → CONFLICTO
     */

    const citaEnConflicto =
        await prisma.cita.findFirst({
            where: {
                profesionalId:
                    data.profesionalId,

                fechaCita: {
                    gte:
                        inicioDia,

                    lte:
                        finDia,
                },

                estado: {
                    in: [
                        "PENDIENTE",
                        "ACEPTADA",
                    ],
                },

                /*
                 * existenteInicio <
                 * nuevaFinal
                 */
                horaInicio: {
                    lt:
                        horaFinalComparacion,
                },

                /*
                 * existenteFinal >
                 * nuevaInicio
                 */
                horaFinalizacion: {
                    gt:
                        horaInicioComparacion,
                },
            },

            select: {
                id: true,
                fechaCita: true,
                horaInicio: true,
                horaFinalizacion: true,
                estado: true,
            },
        });


    if (citaEnConflicto) {
        throw AppError.badRequest(
            "El profesional ya tiene una cita que coincide con el horario seleccionado",
        );
    }


    /*
     * =====================================================
     * 10. CREAR CITA
     * =====================================================
     *
     * El API controla:
     *
     * - hora final
     * - monto
     * - estado inicial
     */

    return prisma.$transaction(
        async (tx) => {

            const cita =
                await tx.cita.create({
                    data: {
                        clienteId:
                            data.clienteId,

                        profesionalId:
                            data.profesionalId,

                        servicioId:
                            data.servicioId,

                        fechaCita:
                            fechaCita,

                        /*
                         * Guardamos los valores
                         * compatibles con @db.Time.
                         */
                        horaInicio:
                            horaInicioComparacion,

                        horaFinalizacion:
                            horaFinalComparacion,

                        modalidad:
                            data.modalidad,

                        /*
                         * El cliente nunca decide
                         * el estado inicial.
                         */
                        estado:
                            "PENDIENTE",

                        comentarioCliente:
                            data.comentarioCliente,

                        /*
                         * Precio histórico.
                         *
                         * Se copia del servicio
                         * en el momento de solicitar
                         * la cita.
                         */
                        montoEstimado:
                            servicio.precio,
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

                        resena: true,
                    },
                });


            /*
             * =================================================
             * 11. HISTORIAL DE ESTADO
             * =================================================
             */

            await tx
                .historialEstadoCita
                .create({
                    data: {
                        citaId:
                            cita.id,

                        estadoAnterior:
                            null,

                        estadoNuevo:
                            "PENDIENTE",

                        comentario:
                            "Cita creada",

                        cambiadoPorId:
                            data.clienteId,
                    },
                });


            return cita;
        },
    );
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

    async completar(
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
         * Solo el profesional dueño de la cita
         * puede completarla.
         */
        if (
            cita.profesional.usuario.id !== usuarioId
        ) {
            throw AppError.badRequest(
                "No tiene permiso para gestionar esta cita",
            );
        }

        /*
         * Solo una cita ACEPTADA puede completarse.
         */
        if (cita.estado !== "ACEPTADA") {
            throw AppError.badRequest(
                "Solo se pueden completar citas aceptadas",
            );
        }

        /*
         * Combina la fecha de la cita con
         * la hora programada.
         */
        const fechaProgramada =
            new Date(cita.fechaCita);

        const horaInicio =
            new Date(cita.horaInicio);

        fechaProgramada.setHours(
            horaInicio.getHours(),
            horaInicio.getMinutes(),
            horaInicio.getSeconds(),
            0,
        );

        const ahora = new Date();

        /*
         * No permite completar antes
         * de la fecha y hora programadas.
         */
        if (ahora < fechaProgramada) {
            throw AppError.badRequest(
                "La cita no puede completarse antes de la fecha y hora programadas",
            );
        }

        return prisma.$transaction(async (tx) => {

            const citaActualizada =
                await tx.cita.update({
                    where: {
                        id: citaId,
                    },

                    data: {
                        estado: "COMPLETADA",
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
                        "ACEPTADA",

                    estadoNuevo:
                        "COMPLETADA",

                    comentario:
                        "Cita completada por el profesional",

                    cambiadoPorId:
                        usuarioId,
                },
            });

            return citaActualizada;
        });
    },

    async cancelar(
        citaId: number,
        usuarioId: number,
        comentarioCliente: string,
    ) {
        const cita = await prisma.cita.findUnique({
            where: {
                id: citaId,
            },
        });


        if (!cita) {
            throw AppError.notFound(
                "La cita indicada no existe",
            );
        }

        /*
         * Verifica que la cita pertenezca
         * al cliente autenticado.
         */
        if (cita.clienteId !== usuarioId) {
            throw AppError.badRequest(
                "No tiene permiso para cancelar esta cita",
            );
        }

        /*
         * Solo se permite cancelar citas
         * PENDIENTES o ACEPTADAS.
         */
        if (
            cita.estado !== "PENDIENTE" &&
            cita.estado !== "ACEPTADA"
        ) {
            throw AppError.badRequest(
                "La cita no puede cancelarse en su estado actual",
            );
        }

        /*
         * El motivo es obligatorio.
         */
        const motivo =
            comentarioCliente?.trim();

        if (!motivo || motivo.length < 3) {
            throw AppError.badRequest(
                "Debe indicar el motivo de la cancelación",
            );
        }

        const estadoAnterior =
            cita.estado;

        return prisma.$transaction(async (tx) => {

            const citaActualizada =
                await tx.cita.update({
                    where: {
                        id: citaId,
                    },

                    data: {
                        estado: "CANCELADA",

                        /*
                         * Guarda el motivo enviado
                         * por el cliente.
                         */
                        comentarioCliente:
                            motivo,
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
                        estadoAnterior,

                    estadoNuevo:
                        "CANCELADA",

                    comentario:
                        motivo,

                    cambiadoPorId:
                        usuarioId,
                },
            });

            return citaActualizada;
        });
    },

    async obtenerDetalleProfesional(
        citaId: number,
        usuarioId: number,
    ) {
        const profesional =
            await prisma.perfilProfesional.findUnique({
                where: {
                    usuarioId,
                },
            });

        if (!profesional) {
            throw AppError.notFound(
                "El usuario autenticado no tiene un perfil profesional",
            );
        }

        const cita = await prisma.cita.findFirst({
            where: {
                id: citaId,
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
            },
        });

        if (!cita) {
            throw AppError.notFound(
                "La cita indicada no existe o no pertenece al profesional autenticado",
            );
        }

        return cita;
    },

    async misCitasCliente(usuarioId: number) {
        return prisma.cita.findMany({
            where: {
                clienteId: usuarioId,
            },

            include: {
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


    async obtenerDetalleCliente(
        citaId: number,
        usuarioId: number,
    ) {
        const cita = await prisma.cita.findFirst({
            where: {
                id: citaId,
                clienteId: usuarioId,
            },

            include: {
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
            },
        });

        if (!cita) {
            throw AppError.notFound(
                "La cita indicada no existe o no pertenece al cliente autenticado",
            );
        }

        return cita;
    },



};