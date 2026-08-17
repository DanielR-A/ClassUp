-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(150) NOT NULL,
    `correo` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(30) NULL,
    `role` ENUM('ADMIN', 'PROFESIONAL', 'USER') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfiles_profesionales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `tituloProfesional` VARCHAR(150) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `annosExperiencia` INTEGER NOT NULL,
    `modalidad` ENUM('VIRTUAL', 'PRESENCIAL', 'MIXTA') NOT NULL,
    `provincia` VARCHAR(100) NOT NULL,
    `canton` VARCHAR(100) NOT NULL,
    `distrito` VARCHAR(100) NOT NULL,
    `tarifaBase` DECIMAL(10, 2) NOT NULL,
    `disponible` BOOLEAN NOT NULL DEFAULT true,
    `imagenPerfil` VARCHAR(255) NOT NULL DEFAULT 'profile-not-found.jpg',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `perfiles_profesionales_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categorias_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `especialidades_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profesionalId` INTEGER NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `duracionMinutos` INTEGER NOT NULL,
    `modalidad` ENUM('VIRTUAL', 'PRESENCIAL', 'MIXTA') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `profesionalId` INTEGER NOT NULL,
    `servicioId` INTEGER NOT NULL,
    `fechaCita` DATE NOT NULL,
    `horaInicio` TIME(0) NOT NULL,
    `horaFinalizacion` TIME(0) NOT NULL,
    `modalidad` ENUM('VIRTUAL', 'PRESENCIAL') NOT NULL,
    `estado` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
    `comentarioCliente` VARCHAR(500) NULL,
    `comentarioProfesional` VARCHAR(500) NULL,
    `montoEstimado` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `citas_clienteId_idx`(`clienteId`),
    INDEX `citas_profesionalId_idx`(`profesionalId`),
    INDEX `citas_servicioId_idx`(`servicioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_estado_citas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citaId` INTEGER NOT NULL,
    `estadoAnterior` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NULL,
    `estadoNuevo` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL,
    `comentario` VARCHAR(500) NULL,
    `cambiadoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resenas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citaId` INTEGER NOT NULL,
    `clienteId` INTEGER NOT NULL,
    `profesionalId` INTEGER NOT NULL,
    `puntuacion` INTEGER NOT NULL,
    `comentario` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `resenas_citaId_key`(`citaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EspecialidadToPerfilProfesional` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EspecialidadToPerfilProfesional_AB_unique`(`A`, `B`),
    INDEX `_EspecialidadToPerfilProfesional_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EspecialidadToServicio` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EspecialidadToServicio_AB_unique`(`A`, `B`),
    INDEX `_EspecialidadToServicio_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `perfiles_profesionales` ADD CONSTRAINT `perfiles_profesionales_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicios` ADD CONSTRAINT `servicios_profesionalId_fkey` FOREIGN KEY (`profesionalId`) REFERENCES `perfiles_profesionales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicios` ADD CONSTRAINT `servicios_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_profesionalId_fkey` FOREIGN KEY (`profesionalId`) REFERENCES `perfiles_profesionales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `servicios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_estado_citas` ADD CONSTRAINT `historial_estado_citas_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `citas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resenas` ADD CONSTRAINT `resenas_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `citas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resenas` ADD CONSTRAINT `resenas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resenas` ADD CONSTRAINT `resenas_profesionalId_fkey` FOREIGN KEY (`profesionalId`) REFERENCES `perfiles_profesionales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToPerfilProfesional` ADD CONSTRAINT `_EspecialidadToPerfilProfesional_A_fkey` FOREIGN KEY (`A`) REFERENCES `especialidades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToPerfilProfesional` ADD CONSTRAINT `_EspecialidadToPerfilProfesional_B_fkey` FOREIGN KEY (`B`) REFERENCES `perfiles_profesionales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToServicio` ADD CONSTRAINT `_EspecialidadToServicio_A_fkey` FOREIGN KEY (`A`) REFERENCES `especialidades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToServicio` ADD CONSTRAINT `_EspecialidadToServicio_B_fkey` FOREIGN KEY (`B`) REFERENCES `servicios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
