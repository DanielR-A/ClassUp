// Tu controller es la capa que recibe las 
// peticiones HTTP del cliente 
// (Angular, Postman, etc.), 
// las valida y llama al service para 
// ejecutar la lógica de negocio. Después, 
// construye y devuelve la respuesta al 
// cliente.
import {
    Request,
    Response,
    NextFunction,
} from "express";

import { StatusCodes } from "http-status-codes";
import { categoriaService } from "../services/categoria.service";

export class CategoriaController {

    // ==========================================================
    // LISTAR TODAS LAS CATEGORÍAS
    // GET /categoria
    // ==========================================================
    listar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {

        // Llama al service para obtener todas las categorías
        const resultado = await categoriaService.listar();

        // Devuelve una respuesta HTTP 200 (OK)
        return response.status(StatusCodes.OK).json({
            success: true,
            data: resultado,
        });
    };

    // ==========================================================
    // OBTENER UNA CATEGORÍA POR ID
    // GET /categoria/:id
    // ==========================================================
    obtenerPorId = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {

        // Obtiene el parámetro "id" enviado en la URL
        const rawId = Array.isArray(request.params.id)
            ? request.params.id[0]
            : request.params.id;

        // Convierte el id recibido de texto a número
        const id = parseInt(rawId ?? "", 10);

        // Si el id no es un número válido devuelve un error 400
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "ID inválido",
            });
        }

        // Busca la categoría utilizando el service
        const categoria = await categoriaService.obtenerPorId(id);

        // Si no existe la categoría devuelve un error 404
        if (!categoria) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Categoría no encontrada",
            });
        }

        // Devuelve la categoría encontrada
        return response.status(StatusCodes.OK).json({
            success: true,
            data: categoria,
        });
    };

    // ==========================================================
    // CAMBIAR EL ESTADO DE UNA CATEGORÍA
    // PATCH /categoria/:id/estado
    // ==========================================================
    cambiarEstado = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {

        // Obtiene el id enviado en la URL
        const rawId = Array.isArray(request.params.id)
            ? request.params.id[0]
            : request.params.id;

        // Convierte el id a número
        const id = parseInt(rawId ?? "", 10);

        // Verifica que el id sea válido
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "ID inválido",
            });
        }

        // Obtiene el nuevo estado enviado en el body
        const { estado } = request.body;

        // Valida que el estado sea únicamente true o false
        if (typeof estado !== "boolean") {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "El estado debe ser true o false",
            });
        }

        // Verifica que la categoría exista antes de modificarla
        const categoriaExistente =
            await categoriaService.obtenerPorId(id);

        if (!categoriaExistente) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Categoría no encontrada",
            });
        }

        // Llama al service para actualizar el estado
        const categoria =
            await categoriaService.cambiarEstado(
                id,
                estado,
            );

        // Devuelve un mensaje dependiendo del nuevo estado
        return response.status(StatusCodes.OK).json({
            success: true,
            message: categoria.estado
                ? "Categoría activada correctamente"
                : "Categoría desactivada correctamente",
            data: categoria,
        });
    };
}