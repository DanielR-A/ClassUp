import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../config/prisma";
import jwt, {
    Secret,
    SignOptions,
} from "jsonwebtoken";

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

        async registrar(data: {
        correo: string;
        password: string;
        nombre: string;
        apellidos: string;
        role?: Role;
    }) {
        const usuarioExists = await prisma.usuario.findUnique({
            where: { correo: data.correo }
        });
        if (usuarioExists) {
            throw new Error("El correo ya está registrado");
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const usuario = await prisma.usuario.create({
            data: {
                correo: data.correo,
                password: hashedPassword,
                nombre: data.nombre,
                apellidos: data.apellidos,
                role: data.role ?? Role.USER,
            },
        });
        const { password, ...usuarioWithoutPassword } = usuario;
        return usuarioWithoutPassword;
    },

        async login(data: { correo: string; password: string }) {
        const usuario = await prisma.usuario.findUnique({
            where: { correo: data.correo }
        });
        if (!usuario) {
            throw new Error("Correo o contraseña incorrectos");
        }
        const isPasswordValid = await bcrypt.compare(data.password, usuario.password);
        if (!isPasswordValid) {
            throw new Error("Correo o contraseña incorrectos");
        }
        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            role: usuario.role,
        };
        const secret: Secret = process.env.JWT_SECRET || "vj_utn_2026";
        const options: SignOptions = {
            expiresIn: "2h",
        };
        const token = jwt.sign(payload, secret, options);
        return {
            token
        };
    },

        async perfil(usuarioId: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
        });
        if (!usuario) {
            throw new Error("El usuario no existe");
        }
        const { password, ...usuarioSinPassword } = usuario;

        return usuarioSinPassword;
    },

};