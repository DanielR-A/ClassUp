import { RoleMap, getEnumOptions } from "../utils/enum-mappers";
import { Role } from "../../generated/prisma";

export const roleService = {
    async listar() {
        return getEnumOptions(RoleMap);
    },

    async obtenerPorId(id: string) {
        const key = id.toUpperCase() as Role;
        const label = RoleMap[key];

        if (!label) return null;

        return {
            value: key,
            label: label
        };
    }
};