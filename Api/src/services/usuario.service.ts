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
                    email: true,
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
                email: true,
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
                email: true,
                telefono: true,
                cedula: true,
                role: true,
                estado: true,
                updatedAt: true,
            },
        });
    },





async crear(data: {
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    telefono?: string;
    cedula?: string;
    role?: Role;
}) {
    const usuarioExiste =
        await prisma.usuario.findUnique({
            where: {
                email: data.email,
            },
        });

    if (usuarioExiste) {
        throw new Error(
            "El correo ya está registrado"
        );
    }

    const hashedPassword =
        await bcrypt.hash(
            data.password,
            10
        );

    const usuario =
        await prisma.usuario.create({
            data: {
                nombre: data.nombre,
                apellidos: data.apellidos,
                email: data.email,
                password: hashedPassword,
                telefono: data.telefono,
                cedula: data.cedula,
                role:
                    data.role ??
                    Role.USER,
                estado: true,
            },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                telefono: true,
                cedula: true,
                role: true,
                estado: true,
                createdAt: true,
                updatedAt: true,
            },
        });

    return usuario;
},



async actualizar(
    id: number,
    data: {
        nombre?: string;
        apellidos?: string;
        email?: string;
        password?: string;
        telefono?: string;
        cedula?: string;
        role?: Role;
    },
) {
    const usuarioActual =
        await prisma.usuario.findUnique({
            where: {
                id,
            },
        });

    if (!usuarioActual) {
        throw new Error(
            "Usuario no encontrado"
        );
    }

    // Si cambia el correo, verifica que no pertenezca
    // a otro usuario.
    if (
        data.email &&
        data.email !== usuarioActual.email
    ) {
        const usuarioConCorreo =
            await prisma.usuario.findUnique({
                where: {
                    email: data.email,
                },
            });

        if (usuarioConCorreo) {
            throw new Error(
                "El correo ya está registrado"
            );
        }
    }

    // Solo cifra una nueva contraseña
    // cuando realmente se envía una.
    let hashedPassword:
        string | undefined;

    if (
        data.password &&
        data.password.trim()
    ) {
        hashedPassword =
            await bcrypt.hash(
                data.password,
                10
            );
    }

    return await prisma.usuario.update({
        where: {
            id,
        },

        data: {
            nombre: data.nombre,
            apellidos: data.apellidos,
            email: data.email,

            password:
                hashedPassword,

            telefono: data.telefono,
            cedula: data.cedula,
            role: data.role,
        },

        select: {
            id: true,
            nombre: true,
            apellidos: true,
            email: true,
            telefono: true,
            cedula: true,
            role: true,
            estado: true,
            createdAt: true,
            updatedAt: true,
        },
    });
},





async registrar(data: {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    telefono?: string;
    cedula?: string;
    role?: Role;
}) {
    // Verificar correo duplicado
    const usuarioExists =
        await prisma.usuario.findUnique({
            where: {
                email: data.email,
            },
        });

    if (usuarioExists) {
        throw new Error(
            "El correo ya está registrado"
        );
    }

    // Verificar cédula duplicada
    if (data.cedula) {
        const cedulaExists =
            await prisma.usuario.findUnique({
                where: {
                    cedula: data.cedula,
                },
            });

        if (cedulaExists) {
            throw new Error(
                "La cédula ya está registrada"
            );
        }
    }

    const hashedPassword =
        await bcrypt.hash(
            data.password,
            10
        );

    const usuario =
        await prisma.usuario.create({
            data: {
                email: data.email,
                password: hashedPassword,
                nombre: data.nombre,
                apellidos: data.apellidos,
                telefono: data.telefono,
                cedula: data.cedula,

                // Registro público siempre USER
                role: Role.USER,

                estado: true,
            },
        });

    const {
        password,
        ...usuarioWithoutPassword
    } = usuario;

    return usuarioWithoutPassword;
},

        async login(data: { email: string; password: string }) {
        const usuario = await prisma.usuario.findUnique({
            where: { email: data.email }
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
            email: usuario.email,
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