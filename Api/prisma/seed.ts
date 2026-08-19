import { prisma } from "../src/config/prisma";
import {
    EstadoCita,
    Modalidad,
    ModalidadCita,
    Role,
} from "../generated/prisma/enums";

async function main() {
    console.log("Iniciando seed...");

    // =====================================================
    // 1. LIMPIEZA DE DATOS
    // =====================================================

    await prisma.resena.deleteMany();
    await prisma.historialEstadoCita.deleteMany();
    await prisma.cita.deleteMany();
    await prisma.servicio.deleteMany();
    await prisma.perfilProfesional.deleteMany();
    await prisma.especialidad.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.usuario.deleteMany();

    // =====================================================
    // 2. CATEGORÍAS
    // =====================================================

    await prisma.categoria.createMany({
        data: [
            {
                nombre: "Matemáticas",
                descripcion: "Tutorías de matemáticas, álgebra y cálculo",
                estado: true,
            },
            {
                nombre: "Idiomas",
                descripcion: "Tutorías y clases de diferentes idiomas",
                estado: true,
            },
            {
                nombre: "Programación",
                descripcion: "Desarrollo de software y tecnologías",
                estado: true,
            },
            {
                nombre: "Ciencias",
                descripcion: "Tutorías de física, química y biología",
                estado: true,
            },
            {
                nombre: "Arte y Diseño",
                descripcion: "Tutorías de dibujo, pintura, diseño gráfico y creatividad",
                estado: true,
            },
        ],
    });

    // =====================================================
    // 3. ESPECIALIDADES
    // =====================================================

    await prisma.especialidad.createMany({
        data: [
            {
                nombre: "Álgebra",
                descripcion: "Ecuaciones, funciones y expresiones algebraicas",
                estado: true,
            },
            {
                nombre: "Cálculo",
                descripcion: "Límites, derivadas e integrales",
                estado: true,
            },
            {
                nombre: "Inglés",
                descripcion: "Inglés básico, intermedio y avanzado",
                estado: true,
            },
            {
                nombre: "Java",
                descripcion: "Programación orientada a objetos con Java",
                estado: true,
            },
            {
                nombre: "Angular",
                descripcion: "Desarrollo de aplicaciones web con Angular",
                estado: true,
            },
            {
                nombre: "Python",
                descripcion: "Programación y automatización con Python",
                estado: true,
            },
            {
                nombre: "Física",
                descripcion: "Mecánica, movimiento, fuerza y energía",
                estado: true,
            },
            {
                nombre: "Química",
                descripcion: "Química general y resolución de ejercicios",
                estado: true,
            },

            {
                nombre: "JavaScript",
                descripcion: "Programación con JavaScript para aplicaciones web.",
                estado: true,
            },
            {
                nombre: "Node.js",
                descripcion: "Desarrollo de aplicaciones y APIs con Node.js.",
                estado: true,
            },
            {
                nombre: "Bases de Datos",
                descripcion: "Diseño, consultas y administración de bases de datos.",
                estado: true,
            },
            {
                nombre: "Francés",
                descripcion: "Francés básico, intermedio y conversación",
                estado: true,
            },
            {
                nombre: "Biología",
                descripcion: "Biología general, genética y anatomía",
                estado: true,
            },

        ],
    });

    // =====================================================
    // 4. USUARIOS
    // =====================================================

    await prisma.usuario.createMany({
        data: [
            {
                nombre: "Administrador",
                apellidos: "Sistema",
                email: "admin@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-0000",
                cedula: "101010101",
                role: Role.ADMIN,
                estado: true,
            },
            {
                nombre: "Juan",
                apellidos: "Pérez",
                email: "juan@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-1111",
                cedula: "103030303",
                role: Role.USER,
                estado: true,
            },
            {
                nombre: "Sofía",
                apellidos: "Gómez",
                email: "sofia@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-2222",
                cedula: "104040404",
                role: Role.USER,
                estado: true,
            },
            {
                nombre: "María",
                apellidos: "Rodríguez",
                email: "maria@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-3333",
                cedula: "104040405",
                role: Role.PROFESIONAL,
                estado: true,
            },
            {
                nombre: "Carlos",
                apellidos: "Ramírez",
                email: "carlos@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-4444",
                cedula: "104040406",
                role: Role.PROFESIONAL,
                estado: true,
            },
            {
                nombre: "Ana",
                apellidos: "Mora",
                email: "ana@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-5555",
                cedula: "404040407",
                role: Role.PROFESIONAL,
                estado: true,
            },
            {
                nombre: "Luis",
                apellidos: "Fernández",
                email: "luis@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-6666",
                cedula: "404040408", 
                role: Role.USER,
                estado: true,
            },
            {
                nombre: "Valeria",
                apellidos: "Castro",
                email: "valeria@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-7777",
                cedula: "404040409",
                role: Role.USER,
                estado: true,
            },
            {
                nombre: "Diego",
                apellidos: "Sánchez",
                email: "diego@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-8888",
                cedula: "504040410",
                role: Role.PROFESIONAL,
                estado: true,
            },
            {
                nombre: "Laura",
                apellidos: "Vargas",
                email: "laura@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-9999",
                cedula: "504040411",
                role: Role.PROFESIONAL,
                estado: true,
            },

            {
                nombre: "Pedro",
                apellidos: "Álvarez",
                email: "pedro@classup.com",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "8888-1010",
                cedula: "504040412",
                role: Role.PROFESIONAL,
                estado: true,
            },

        ],
    });

    // =====================================================
    // 5. RECUPERAR DATOS CREADOS
    // =====================================================

    const [usuarios, categorias, especialidades] = await Promise.all([
        prisma.usuario.findMany(),
        prisma.categoria.findMany(),
        prisma.especialidad.findMany(),
    ]);

    const userMap = Object.fromEntries(usuarios.map((u) => [u.email, u.id]));
    const catMap = Object.fromEntries(categorias.map((c) => [c.nombre, c.id]));
    const espMap = Object.fromEntries(especialidades.map((e) => [e.nombre, e.id]));

    // =====================================================
    // 6. PERFILES PROFESIONALES
    // =====================================================

    const maria = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["maria@classup.com"],
            tituloProfesional: "Ingeniera en Software",
            descripcion:
                "Profesional especializada en programación, desarrollo web y aplicaciones empresariales.",
            annosExperiencia: 5,
            modalidad: Modalidad.MIXTA,
            provincia: "San José",
            canton: "Central",
            distrito: "Carmen",
            tarifaBase: 15000,
            disponible: true,
            imagenPerfil: "maria-rodriguez.jpg",

            especialidades: {
                connect: [
                    { id: espMap["Java"] },
                    { id: espMap["Angular"] },
                    { id: espMap["Python"] },
                ],
            },
        },
    });

    const carlos = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["carlos@classup.com"],
            tituloProfesional: "Profesor de Matemáticas",
            descripcion:
                "Profesor especializado en álgebra, cálculo y preparación para exámenes.",
            annosExperiencia: 8,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "Alajuela",
            canton: "Alajuela",
            distrito: "San José",
            tarifaBase: 12000,
            disponible: true,
            imagenPerfil: "carlos-ramirez.jpg",

            especialidades: {
                connect: [
                    { id: espMap["Álgebra"] },
                    { id: espMap["Cálculo"] },
                ],
            },
        },
    });

    const ana = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["ana@classup.com"],
            tituloProfesional: "Profesora de Ciencias e Inglés",
            descripcion:
                "Profesora con experiencia en inglés, física y química para estudiantes de secundaria.",
            annosExperiencia: 6,
            modalidad: Modalidad.MIXTA,
            provincia: "Heredia",
            canton: "Heredia",
            distrito: "Mercedes",
            tarifaBase: 10000,
            disponible: true,
            imagenPerfil: "ana-mora.jpg",

            especialidades: {
                connect: [
                    { id: espMap["Inglés"] },
                    { id: espMap["Física"] },
                    { id: espMap["Química"] },
                ],
            },
        },
    });


    const diego = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["diego@classup.com"],
            tituloProfesional: "Desarrollador Full Stack",
            descripcion:
                "Especialista en desarrollo de aplicaciones web con experiencia en Node.js, React y bases de datos.",
            annosExperiencia: 4,
            modalidad: Modalidad.VIRTUAL,
            provincia: "Cartago",
            canton: "Central",
            distrito: "Oriental",
            tarifaBase: 14000,
            disponible: true,
            imagenPerfil: "diego-sanchez.jpg",

            especialidades: {
                connect: [
                    { id: espMap["JavaScript"] },
                    { id: espMap["Node.js"] },
                    { id: espMap["Bases de Datos"] },
                ],
            },
        },
    });

    const laura = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["laura@classup.com"],
            tituloProfesional: "Profesora de Idiomas",
            descripcion:
                "Docente especializada en la enseñanza del inglés y francés para jóvenes y adultos.",
            annosExperiencia: 7,
            modalidad: Modalidad.MIXTA,
            provincia: "San José",
            canton: "Escazú",
            distrito: "San Rafael",
            tarifaBase: 13000,
            disponible: true,
            imagenPerfil: "laura-vargas.jpg",

            especialidades: {
                connect: [
                    { id: espMap["Inglés"] },
                    { id: espMap["Francés"] },
                ],
            },
        },
    });

    const pedro = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["pedro@classup.com"],
            tituloProfesional: "Profesor de Ciencias",
            descripcion:
                "Especialista en biología y química con experiencia en preparación para bachillerato.",
            annosExperiencia: 9,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "Puntarenas",
            canton: "Puntarenas",
            distrito: "El Roble",
            tarifaBase: 12500,
            disponible: true,
            imagenPerfil: "pedro-alvarez.jpg",

            especialidades: {
                connect: [
                    { id: espMap["Biología"] },
                    { id: espMap["Química"] },
                ],
            },
        },
    });

    // =====================================================
    // 7. SERVICIOS Y CONEXIONES CON ESPECIALIDADES
    // =====================================================

    const servicioAngular = await prisma.servicio.create({
        data: {
            profesionalId: maria.id,
            categoriaId: catMap["Programación"],
            nombre: "Tutoría de Angular",
            descripcion:
                "Clases personalizadas para aprender Angular desde cero.",
            precio: 20000,
            duracionMinutos: 120,
            modalidad: Modalidad.VIRTUAL,
            estado: true,

            especialidades: {
                connect: [{ id: espMap["Angular"] }],
            },
        },
    });

    const servicioJava = await prisma.servicio.create({
        data: {
            profesionalId: maria.id,
            categoriaId: catMap["Programación"],
            nombre: "Programación con Java",
            descripcion:
                "Tutorías de Java, programación orientada a objetos y desarrollo de proyectos.",
            precio: 18000,
            duracionMinutos: 90,
            modalidad: Modalidad.MIXTA,
            estado: true,

            especialidades: {
                connect: [
                    { id: espMap["Java"] },
                    { id: espMap["Python"] },
                ],
            },
        },
    });

    const servicioAlgebra = await prisma.servicio.create({
        data: {
            profesionalId: carlos.id,
            categoriaId: catMap["Matemáticas"],
            nombre: "Tutoría de Álgebra",
            descripcion:
                "Resolución de ecuaciones, funciones y ejercicios algebraicos.",
            precio: 12000,
            duracionMinutos: 60,
            modalidad: Modalidad.PRESENCIAL,
            estado: true,

            especialidades: {
                connect: [{ id: espMap["Álgebra"] }],
            },
        },
    });

    const servicioCalculo = await prisma.servicio.create({
        data: {
            profesionalId: carlos.id,
            categoriaId: catMap["Matemáticas"],
            nombre: "Tutoría de Cálculo",
            descripcion:
                "Clases de límites, derivadas, integrales y aplicaciones.",
            precio: 15000,
            duracionMinutos: 90,
            modalidad: Modalidad.MIXTA,
            estado: true,

            especialidades: {
                connect: [
                    { id: espMap["Cálculo"] },
                    { id: espMap["Álgebra"] },
                ],
            },
        },
    });

    const servicioIngles = await prisma.servicio.create({
        data: {
            profesionalId: ana.id,
            categoriaId: catMap["Idiomas"],
            nombre: "Clases de Inglés",
            descripcion:
                "Clases de conversación, gramática y preparación para exámenes.",
            precio: 10000,
            duracionMinutos: 60,
            modalidad: Modalidad.VIRTUAL,
            estado: true,

            especialidades: {
                connect: [{ id: espMap["Inglés"] }],
            },
        },
    });

    const servicioFisica = await prisma.servicio.create({
        data: {
            profesionalId: ana.id,
            categoriaId: catMap["Ciencias"],
            nombre: "Tutoría de Física",
            descripcion:
                "Tutorías de movimiento, fuerza, energía y resolución de problemas.",
            precio: 14000,
            duracionMinutos: 90,
            modalidad: Modalidad.PRESENCIAL,
            estado: true,

            especialidades: {
                connect: [
                    { id: espMap["Física"] },
                    { id: espMap["Álgebra"] },
                ],
            },
        },
    });

    const servicioNode = await prisma.servicio.create({
        data: {
            profesionalId: diego.id,
            categoriaId: catMap["Programación"],
            nombre: "Desarrollo con Node.js",
            descripcion:
                "Tutorías de Node.js, Express y desarrollo de APIs REST.",
            precio: 19000,
            duracionMinutos: 120,
            modalidad: Modalidad.VIRTUAL,
            estado: true,

            especialidades: {
                connect: [
                    { id: espMap["Node.js"] },
                    { id: espMap["JavaScript"] },
                ],
            },
        },
    });

    const servicioFrances = await prisma.servicio.create({
        data: {
            profesionalId: laura.id,
            categoriaId: catMap["Idiomas"],
            nombre: "Clases de Francés",
            descripcion:
                "Aprende francés desde nivel básico hasta intermedio con clases personalizadas.",
            precio: 13000,
            duracionMinutos: 90,
            modalidad: Modalidad.MIXTA,
            estado: true,

            especialidades: {
                connect: [
                    { id: espMap["Francés"] },
                ],
            },
        },
    });

    const servicioBiologia = await prisma.servicio.create({
        data: {
            profesionalId: pedro.id,
            categoriaId: catMap["Ciencias"],
            nombre: "Tutoría de Biología",
            descripcion:
                "Clases de biología general, genética, anatomía y preparación para exámenes.",
            precio: 12500,
            duracionMinutos: 90,
            modalidad: Modalidad.PRESENCIAL,
            estado: true,

            especialidades: {
                connect: [
                    { id: espMap["Biología"] },
                    { id: espMap["Química"] },
                ],
            },
        },
    });

    // =====================================================
    // 8. CITAS
    // =====================================================

    /*
     * Esta cita crea al mismo tiempo:
     * - La cita
     * - Su historial
     * - Su reseña
     */
    const citaCompletadaAngular = await prisma.cita.create({
        data: {
            clienteId: userMap["juan@classup.com"],
            profesionalId: maria.id,
            servicioId: servicioAngular.id,
            fechaCita: new Date("2026-07-01"),
            horaInicio: new Date("1970-01-01T14:00:00"),
            horaFinalizacion: new Date(
                "1970-01-01T16:00:00",
            ),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            comentarioCliente:
                "Necesito ayuda para comprender componentes y servicios.",
            comentarioProfesional:
                "El estudiante completó correctamente los ejercicios.",
            montoEstimado: servicioAngular.precio,

            historial: {
                create: [
                    {
                        estadoAnterior: null,
                        estadoNuevo: EstadoCita.PENDIENTE,
                        comentario:
                            "La cita fue solicitada.",
                        cambiadoPorId:
                            userMap["juan@classup.com"],
                    },
                    {
                        estadoAnterior:
                            EstadoCita.PENDIENTE,
                        estadoNuevo: EstadoCita.ACEPTADA,
                        comentario:
                            "La profesional aceptó la cita.",
                        cambiadoPorId:
                            userMap["maria@classup.com"],
                    },
                    {
                        estadoAnterior:
                            EstadoCita.ACEPTADA,
                        estadoNuevo:
                            EstadoCita.COMPLETADA,
                        comentario:
                            "La tutoría fue completada.",
                        cambiadoPorId:
                            userMap["maria@classup.com"],
                    },
                ],
            },

            resena: {
                create: {
                    clienteId:
                        userMap["juan@classup.com"],
                    profesionalId: maria.id,
                    puntuacion: 5,
                    comentario:
                        "Excelente explicación de Angular.",
                },
            },
        },
    });


    const citaCompletadaAlgebra = await prisma.cita.create({
        data: {
            clienteId: userMap["sofia@classup.com"],
            profesionalId: carlos.id,
            servicioId: servicioAlgebra.id,
            fechaCita: new Date("2026-07-03"),
            horaInicio: new Date("1970-01-01T09:00:00"),
            horaFinalizacion: new Date("1970-01-01T10:00:00"),
            modalidad: ModalidadCita.PRESENCIAL,
            estado: EstadoCita.COMPLETADA,
            comentarioCliente:
                "Quiero repasar ecuaciones para un examen.",
            comentarioProfesional:
                "Se trabajaron ecuaciones de primer y segundo grado.",
            montoEstimado: 12000,
        },
    });

    const citaAceptada = await prisma.cita.create({
        data: {
            clienteId: userMap["sofia@classup.com"],
            profesionalId: maria.id,
            servicioId: servicioJava.id,
            fechaCita: new Date("2026-07-15"),
            horaInicio: new Date("1970-01-01T10:00:00"),
            horaFinalizacion: new Date("1970-01-01T11:30:00"),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.ACEPTADA,
            comentarioCliente:
                "Necesito ayuda con programación orientada a objetos.",
            comentarioProfesional:
                "La cita fue aceptada y se enviará el enlace de reunión.",
            montoEstimado: 18000,
        },
    });

    const citaPendiente = await prisma.cita.create({
        data: {
            clienteId: userMap["juan@classup.com"],
            profesionalId: ana.id,
            servicioId: servicioIngles.id,
            fechaCita: new Date("2026-07-20"),
            horaInicio: new Date("1970-01-01T16:00:00"),
            horaFinalizacion: new Date("1970-01-01T17:00:00"),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.PENDIENTE,
            comentarioCliente:
                "Quiero practicar conversación y pronunciación.",
            montoEstimado: 10000,
        },
    });

    const citaRechazada = await prisma.cita.create({
        data: {
            clienteId: userMap["sofia@classup.com"],
            profesionalId: ana.id,
            servicioId: servicioFisica.id,
            fechaCita: new Date("2026-07-10"),
            horaInicio: new Date("1970-01-01T11:00:00"),
            horaFinalizacion: new Date("1970-01-01T12:30:00"),
            modalidad: ModalidadCita.PRESENCIAL,
            estado: EstadoCita.RECHAZADA,
            comentarioCliente:
                "Necesito ayuda con ejercicios de movimiento.",
            comentarioProfesional:
                "No hay disponibilidad para la fecha seleccionada.",
            montoEstimado: 14000,
        },
    });

    const citaCancelada = await prisma.cita.create({
        data: {
            clienteId: userMap["juan@classup.com"],
            profesionalId: carlos.id,
            servicioId: servicioCalculo.id,
            fechaCita: new Date("2026-07-12"),
            horaInicio: new Date("1970-01-01T13:00:00"),
            horaFinalizacion: new Date("1970-01-01T14:30:00"),
            modalidad: ModalidadCita.PRESENCIAL,
            estado: EstadoCita.CANCELADA,
            comentarioCliente:
                "No podré asistir por motivos personales.",
            montoEstimado: 15000,
        },
    });

    const citaPendienteNode = await prisma.cita.create({
        data: {
            clienteId: userMap["luis@classup.com"],
            profesionalId: diego.id,
            servicioId: servicioNode.id,
            fechaCita: new Date("2026-07-22"),
            horaInicio: new Date("1970-01-01T09:00:00"),
            horaFinalizacion: new Date("1970-01-01T11:00:00"),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.PENDIENTE,
            comentarioCliente:
                "Necesito aprender a crear una API REST con Node.js y Express.",
            montoEstimado: servicioNode.precio,

            historial: {
                create: [
                    {
                        estadoAnterior: null,
                        estadoNuevo: EstadoCita.PENDIENTE,
                        comentario: "La cita fue solicitada.",
                        cambiadoPorId: userMap["luis@classup.com"],
                    },
                ],
            },
        },
    });

    const citaAceptadaFrances = await prisma.cita.create({
        data: {
            clienteId: userMap["valeria@classup.com"],
            profesionalId: laura.id,
            servicioId: servicioFrances.id,
            fechaCita: new Date("2026-07-24"),
            horaInicio: new Date("1970-01-01T14:00:00"),
            horaFinalizacion: new Date("1970-01-01T15:30:00"),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.ACEPTADA,
            comentarioCliente:
                "Quiero comenzar a estudiar francés desde el nivel básico.",
            comentarioProfesional:
                "La cita fue aceptada. Se enviará el enlace de la clase.",
            montoEstimado: servicioFrances.precio,

            historial: {
                create: [
                    {
                        estadoAnterior: null,
                        estadoNuevo: EstadoCita.PENDIENTE,
                        comentario: "La cita fue solicitada.",
                        cambiadoPorId: userMap["valeria@classup.com"],
                    },
                    {
                        estadoAnterior: EstadoCita.PENDIENTE,
                        estadoNuevo: EstadoCita.ACEPTADA,
                        comentario: "La profesional aceptó la cita.",
                        cambiadoPorId: userMap["laura@classup.com"],
                    },
                ],
            },
        },
    });

    const citaCompletadaBiologia = await prisma.cita.create({
        data: {
            clienteId: userMap["juan@classup.com"],
            profesionalId: pedro.id,
            servicioId: servicioBiologia.id,
            fechaCita: new Date("2026-07-06"),
            horaInicio: new Date("1970-01-01T10:00:00"),
            horaFinalizacion: new Date("1970-01-01T11:30:00"),
            modalidad: ModalidadCita.PRESENCIAL,
            estado: EstadoCita.COMPLETADA,
            comentarioCliente:
                "Necesito repasar genética y división celular.",
            comentarioProfesional:
                "Se repasaron los conceptos principales y se resolvieron ejercicios.",
            montoEstimado: servicioBiologia.precio,

            historial: {
                create: [
                    {
                        estadoAnterior: null,
                        estadoNuevo: EstadoCita.PENDIENTE,
                        comentario: "La cita fue solicitada.",
                        cambiadoPorId: userMap["juan@classup.com"],
                    },
                    {
                        estadoAnterior: EstadoCita.PENDIENTE,
                        estadoNuevo: EstadoCita.ACEPTADA,
                        comentario: "El profesional aceptó la cita.",
                        cambiadoPorId: userMap["pedro@classup.com"],
                    },
                    {
                        estadoAnterior: EstadoCita.ACEPTADA,
                        estadoNuevo: EstadoCita.COMPLETADA,
                        comentario: "La tutoría fue completada.",
                        cambiadoPorId: userMap["pedro@classup.com"],
                    },
                ],
            },

            resena: {
                create: {
                    clienteId: userMap["juan@classup.com"],
                    profesionalId: pedro.id,
                    puntuacion: 4,
                    comentario:
                        "Muy buena explicación y ejercicios claros.",
                },
            },
        },
    });

    const citaCanceladaAngular = await prisma.cita.create({
        data: {
            clienteId: userMap["valeria@classup.com"],
            profesionalId: maria.id,
            servicioId: servicioAngular.id,
            fechaCita: new Date("2026-07-18"),
            horaInicio: new Date("1970-01-01T08:00:00"),
            horaFinalizacion: new Date("1970-01-01T10:00:00"),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.CANCELADA,
            comentarioCliente:
                "Necesitaba ayuda con formularios reactivos, pero no podré asistir.",
            montoEstimado: servicioAngular.precio,

            historial: {
                create: [
                    {
                        estadoAnterior: null,
                        estadoNuevo: EstadoCita.PENDIENTE,
                        comentario: "La cita fue solicitada.",
                        cambiadoPorId: userMap["valeria@classup.com"],
                    },
                    {
                        estadoAnterior: EstadoCita.PENDIENTE,
                        estadoNuevo: EstadoCita.CANCELADA,
                        comentario:
                            "La cliente canceló la cita por motivos personales.",
                        cambiadoPorId: userMap["valeria@classup.com"],
                    },
                ],
            },
        },
    });

    const citaRechazadaNode = await prisma.cita.create({
        data: {
            clienteId: userMap["sofia@classup.com"],
            profesionalId: diego.id,
            servicioId: servicioNode.id,
            fechaCita: new Date("2026-07-19"),
            horaInicio: new Date("1970-01-01T17:00:00"),
            horaFinalizacion: new Date("1970-01-01T19:00:00"),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.RECHAZADA,
            comentarioCliente:
                "Quiero aprender autenticación con JWT en Express.",
            comentarioProfesional:
                "No tengo disponibilidad en el horario seleccionado.",
            montoEstimado: servicioNode.precio,

            historial: {
                create: [
                    {
                        estadoAnterior: null,
                        estadoNuevo: EstadoCita.PENDIENTE,
                        comentario: "La cita fue solicitada.",
                        cambiadoPorId: userMap["sofia@classup.com"],
                    },
                    {
                        estadoAnterior: EstadoCita.PENDIENTE,
                        estadoNuevo: EstadoCita.RECHAZADA,
                        comentario:
                            "El profesional rechazó la cita por falta de disponibilidad.",
                        cambiadoPorId: userMap["diego@classup.com"],
                    },
                ],
            },
        },
    });

    const citaCompletadaFrances = await prisma.cita.create({
        data: {
            clienteId: userMap["luis@classup.com"],
            profesionalId: laura.id,
            servicioId: servicioFrances.id,
            fechaCita: new Date("2026-07-08"),
            horaInicio: new Date("1970-01-01T15:00:00"),
            horaFinalizacion: new Date("1970-01-01T16:30:00"),
            modalidad: ModalidadCita.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            comentarioCliente:
                "Quiero practicar pronunciación y vocabulario básico.",
            comentarioProfesional:
                "El estudiante mostró buen avance durante la clase.",
            montoEstimado: servicioFrances.precio,

            historial: {
                create: [
                    {
                        estadoAnterior: null,
                        estadoNuevo: EstadoCita.PENDIENTE,
                        comentario: "La cita fue solicitada.",
                        cambiadoPorId: userMap["luis@classup.com"],
                    },
                    {
                        estadoAnterior: EstadoCita.PENDIENTE,
                        estadoNuevo: EstadoCita.ACEPTADA,
                        comentario: "La profesional aceptó la cita.",
                        cambiadoPorId: userMap["laura@classup.com"],
                    },
                    {
                        estadoAnterior: EstadoCita.ACEPTADA,
                        estadoNuevo: EstadoCita.COMPLETADA,
                        comentario: "La clase de francés fue completada.",
                        cambiadoPorId: userMap["laura@classup.com"],
                    },
                ],
            },

            resena: {
                create: {
                    clienteId: userMap["luis@classup.com"],
                    profesionalId: laura.id,
                    puntuacion: 5,
                    comentario:
                        "Excelente profesora, muy paciente y clara.",
                },
            },
        },
    });





// =====================================================
// 9. HISTORIAL DE CAMBIOS DE ESTADO
// =====================================================
// Aquí solamente se crean los historiales de las citas
// que NO lo crearon de forma anidada anteriormente.

await prisma.historialEstadoCita.createMany({
    data: [
        // Cita completada de Álgebra
        {
            citaId: citaCompletadaAlgebra.id,
            estadoAnterior: null,
            estadoNuevo: EstadoCita.PENDIENTE,
            comentario: "La cita fue solicitada.",
            cambiadoPorId: userMap["sofia@classup.com"],
        },
        {
            citaId: citaCompletadaAlgebra.id,
            estadoAnterior: EstadoCita.PENDIENTE,
            estadoNuevo: EstadoCita.ACEPTADA,
            comentario: "El profesor aceptó la cita.",
            cambiadoPorId: userMap["carlos@classup.com"],
        },
        {
            citaId: citaCompletadaAlgebra.id,
            estadoAnterior: EstadoCita.ACEPTADA,
            estadoNuevo: EstadoCita.COMPLETADA,
            comentario: "La tutoría fue completada.",
            cambiadoPorId: userMap["carlos@classup.com"],
        },

        // Cita aceptada de Java
        {
            citaId: citaAceptada.id,
            estadoAnterior: null,
            estadoNuevo: EstadoCita.PENDIENTE,
            comentario: "Solicitud de tutoría registrada.",
            cambiadoPorId: userMap["sofia@classup.com"],
        },
        {
            citaId: citaAceptada.id,
            estadoAnterior: EstadoCita.PENDIENTE,
            estadoNuevo: EstadoCita.ACEPTADA,
            comentario: "La profesional confirmó disponibilidad.",
            cambiadoPorId: userMap["maria@classup.com"],
        },

        // Cita pendiente de Inglés
        {
            citaId: citaPendiente.id,
            estadoAnterior: null,
            estadoNuevo: EstadoCita.PENDIENTE,
            comentario: "La solicitud está pendiente de respuesta.",
            cambiadoPorId: userMap["juan@classup.com"],
        },

        // Cita rechazada de Física
        {
            citaId: citaRechazada.id,
            estadoAnterior: null,
            estadoNuevo: EstadoCita.PENDIENTE,
            comentario: "Solicitud de tutoría registrada.",
            cambiadoPorId: userMap["sofia@classup.com"],
        },
        {
            citaId: citaRechazada.id,
            estadoAnterior: EstadoCita.PENDIENTE,
            estadoNuevo: EstadoCita.RECHAZADA,
            comentario: "La profesional no tenía disponibilidad.",
            cambiadoPorId: userMap["ana@classup.com"],
        },

        // Cita cancelada de Cálculo
        {
            citaId: citaCancelada.id,
            estadoAnterior: null,
            estadoNuevo: EstadoCita.PENDIENTE,
            comentario: "La cita fue solicitada.",
            cambiadoPorId: userMap["juan@classup.com"],
        },
        {
            citaId: citaCancelada.id,
            estadoAnterior: EstadoCita.PENDIENTE,
            estadoNuevo: EstadoCita.ACEPTADA,
            comentario: "El profesor aceptó la cita.",
            cambiadoPorId: userMap["carlos@classup.com"],
        },
        {
            citaId: citaCancelada.id,
            estadoAnterior: EstadoCita.ACEPTADA,
            estadoNuevo: EstadoCita.CANCELADA,
            comentario: "El cliente canceló la cita.",
            cambiadoPorId: userMap["juan@classup.com"],
        },
    ],
});

    // =====================================================
    // 10. RESEÑAS DE CITAS COMPLETADAS
    // =====================================================

    await prisma.resena.createMany({
        data: [
            {
                citaId: citaCompletadaAlgebra.id,
                clienteId: userMap["sofia@classup.com"],
                profesionalId: carlos.id,
                puntuacion: 4,
                comentario:
                    "Muy buena tutoría. El profesor explicó los ejercicios con claridad.",
            },

        ],
    });

    console.log("Seed completado con éxito.");
}

main()
    .catch((error) => {
        console.error("Error en seed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });