import { Router } from "express";

import { UsuarioRoutes } from "./usuario.routes";
import { CategoriaRoutes } from "./categoria.routes";
import { EspecialidadRoutes } from "./especialidad.routes";
import { PerfilProfesionalRoutes } from "./perfil-profesional.routes";
import { ServicioRoutes } from "./servicio.routes";
import { CitaRoutes } from "./cita.routes";
import { HistorialEstadoCitaRoutes } from "./historial-estado-cita.routes";
import { ResenaRoutes } from "./resena.routes";

// import { ImageRoutes } from './image.routes copy';

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        // ----Agregar las rutas----
        router.use("/usuario", UsuarioRoutes.routes);
        router.use("/categoria", CategoriaRoutes.routes);
        router.use("/especialidad", EspecialidadRoutes.routes);
        router.use("/perfilProfesional", PerfilProfesionalRoutes.routes);
        router.use("/servicio", ServicioRoutes.routes);
        router.use("/cita", CitaRoutes.routes);
        router.use("/historialEstadoCita", HistorialEstadoCitaRoutes.routes);
        router.use("/resena", ResenaRoutes.routes);

        return router;
    }
}