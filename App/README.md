# Sistema de Gestión de Citas

Proyecto desarrollado para el curso:

**ISW-811 - Aplicaciones Web utilizando Software Libre**

Universidad Técnica Nacional (UTN)

## Descripción

Sistema web para la gestión integral de citas entre clientes y profesionales.

La aplicación permite administrar usuarios, profesionales, categorías,
especialidades, servicios, citas, agenda, reseñas y reportes.

El sistema cuenta con tres roles principales:

- Administrador
- Profesional
- Cliente

---

# Tecnologías utilizadas

## Frontend

- Angular 21
- TypeScript
- HTML
- CSS
- Angular Signals
- Angular Router
- HttpClient

## Backend

- Node.js
- Express
- TypeScript
- Prisma ORM 7
- JWT para autenticación

## Base de datos

- MySQL

---

# Requisitos

Antes de ejecutar el proyecto debe tener instalado:

- Node.js LTS
- npm
- Angular CLI 21
- MySQL
- Git

Para comprobar las versiones:

```bash
node -v
npm -v
ng version


proyecto/
│
├── frontend/
│   └── Aplicación Angular
│
├── backend/
│   └── API REST Node.js + Express
│
└── README.md


Entrada de la carpeta 
cd nombre-del-proyecto

Instalar dependencias:
npm install



Prisma

El proyecto utiliza Prisma ORM para manejar la base de datos.

Generar Prisma Client
npx prisma generate

Ejecutar migraciones
npx prisma migrate deploy


Si se trabaja en entorno de desarrollo también puede utilizarse:
npx prisma migrate dev


Seeders

Para cargar los datos iniciales de prueba ejecutar:

npx prisma db seed


Ejecutar Api - Backend
npm run dev

Ejecutar Front APP
para que abra el navegador de una vez se abre
ng server -o 
