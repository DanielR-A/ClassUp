// Se define la estructura de la Base de datos
// El archivo schema.prisma es el archivo principal donde 
// se define la estructura de la base de datos. Aquí se indican los modelos, 
// campos, tipos de datos, llaves primarias, relaciones, enums y nombres 
// reales de tablas en MySQL.
// Cada model representa una tabla y cada atributo representa una columna
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });
export { prisma };