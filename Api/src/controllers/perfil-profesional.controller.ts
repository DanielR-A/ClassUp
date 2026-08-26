import {
    Request,
    Response,
    NextFunction,
} from "express";

import { StatusCodes } from "http-status-codes";

import {
    readdir,
} from "node:fs/promises";

import path from "node:path";

import {
    perfilProfesionalService,
} from "../services/perfil-profesional.service";

import {
    sendSuccess,
} from "../utils/http-response";

import {
    parseId,
} from "../utils/parse-id";


export class PerfilProfesionalController {

    listar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const resultado =
            await perfilProfesionalService
                .listar();

        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: resultado,
            });
    };


    obtenerPorId = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const rawId =
            Array.isArray(
                request.params.id,
            )
                ? request.params.id[0]
                : request.params.id;

        const id =
            parseInt(
                rawId ?? "",
                10,
            );

        if (isNaN(id)) {
            return response
                .status(
                    StatusCodes.BAD_REQUEST,
                )
                .json({
                    success: false,
                    message:
                        "ID inválido",
                });
        }

        const perfil =
            await perfilProfesionalService
                .obtenerPorId(id);

        if (!perfil) {
            return response
                .status(
                    StatusCodes.NOT_FOUND,
                )
                .json({
                    success: false,
                    message:
                        "Perfil profesional no encontrado",
                });
        }

        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: perfil,
            });
    };


    crear = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const perfil =
            await perfilProfesionalService
                .crear(
                    request.body,
                );

        return sendSuccess(
            response,
            perfil,
            "Perfil profesional creado correctamente",
            StatusCodes.CREATED,
        );
    };


    actualizar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const id =
            parseId(
                request.params.id,
            );

        const perfil =
            await perfilProfesionalService
                .actualizar(
                    id,
                    request.body,
                );

        return sendSuccess(
            response,
            perfil,
            "Perfil profesional actualizado correctamente",
        );
    };


    cambiarDisponibilidad = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const id =
            parseId(
                request.params.id,
            );

        const {
            disponible,
        } = request.body;

        const perfil =
            await perfilProfesionalService
                .cambiarDisponibilidad(
                    id,
                    disponible,
                );

        return sendSuccess(
            response,
            perfil,
            disponible
                ? "Profesional disponible para nuevas citas"
                : "Profesional no disponible para nuevas citas",
        );
    };


    /*
     * =====================================================
     * LISTAR IMÁGENES DISPONIBLES
     * =====================================================
     *
     * Devuelve únicamente los nombres de las imágenes
     * existentes dentro de:
     *
     * Api/assets/uploads
     *
     * La base de datos seguirá almacenando únicamente:
     *
     * imagenPerfil = "pedro-alvarez.jpg"
     */
    listarImagenes = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {

        const uploadsPath =
            path.resolve(
                process.cwd(),
                "assets",
                "uploads",
            );

        const archivos =
            await readdir(
                uploadsPath,
                {
                    withFileTypes: true,
                },
            );

        /*
         * Solo permitimos archivos reales
         * y formatos de imagen conocidos.
         */
        const extensionesPermitidas =
            [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
            ];

        const imagenes =
            archivos
                .filter(
                    (archivo) =>
                        archivo.isFile(),
                )
                .map(
                    (archivo) =>
                        archivo.name,
                )
                .filter(
                    (nombre) =>
                        extensionesPermitidas
                            .includes(
                                path
                                    .extname(nombre)
                                    .toLowerCase(),
                            ),
                )
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "es",
                        ),
                );

        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: imagenes,
            });
    };
}