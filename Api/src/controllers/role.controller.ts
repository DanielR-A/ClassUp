import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { roleService } from '../services/role.service';

export class RoleController {
    listar = async (request: Request, response: Response, next: NextFunction) => {

        const resultado = await roleService.listar();
        return response.status(StatusCodes.OK).json({
            success: true,
            data: resultado,
        });

    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {

        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = rawId?.trim();

        if (!id) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID de rol inválido" });
        }

        const role = await roleService.obtenerPorId(id);
        if (!role) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Rol no encontrado" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: role });

    };
}