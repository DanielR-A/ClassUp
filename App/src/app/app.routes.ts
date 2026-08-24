import { Routes } from '@angular/router';

import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';

// Servicios (Cursos)
import { ServicioList } from './pages/servicio/servicio-list/servicio-list';
import { ServicioDetail } from './pages/servicio/servicio-detail/servicio-detail';
import { ServicioAdminList } from './pages/servicio/servicio-admin-list/servicio-admin-list';
import { ServicioCreatePage } from './pages/servicio/servicio-create-page/servicio-create-page';
import { ServicioEditPage } from './pages/servicio/servicio-edit-page/servicio-edit-page';

// Usuarios
import { UsuarioCreatePage } from './pages/usuarios/usuario-create-page/usuario-create-page';
import { UsuarioEditPage } from './pages/usuarios/usuario-edit-page/usuario-edit-page';
import { UsuariosList } from './pages/usuarios/usuarios-list/usuarios-list';

// Profesionales
import { ProfesionalesList } from './pages/profesionales/profesionales-list/profesionales-list';
import { ProfesionalDetail } from './pages/profesionales/profesional-detail/profesional-detail';
import { ProfesionalCreatePage } from './pages/profesionales/profesional-create-page/profesional-create-page';
import { ProfesionalEditPage } from './pages/profesionales/profesional-edit-page/profesional-edit-page';

// Categorías y especialidades
import { CategoriasList } from './pages/categorias/categorias-list/categorias-list';
import { EspecialidadesList } from './pages/especialidades/especialidades-list/especialidades-list';

// Citas
import { CitasList } from './pages/citas/citas-list/citas-list';
import { CitaDetail } from './pages/citas/cita-detail/cita-detail';
import { CitaCreatePage } from './pages/citas/cita-create-page/cita-create-page';

// Reseñas
import { ResenasList } from './pages/resenas/resenas-list/resenas-list';

// Autenticación
import { Login } from './pages/usuarios/login/login';
import { Perfil } from './pages/perfil/perfil/perfil';
import { SinAutorizacion } from './pages/auth/sin-autorizacion/sin-autorizacion';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { Role } from './core/models/usuario.model';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [

            // =====================
            // INICIO
            // =====================

            {
                path: '',
                component: Home,
                title: 'Inicio',
            },

            // =====================
            // AUTENTICACIÓN
            // =====================

            {
                path: 'login',
                component: Login,
                title: 'Iniciar sesión',
            },

            {
                path: 'perfil',
                component: Perfil,
                title: 'Mi perfil',
                canActivate: [authGuard],
            },

            {
                path: 'sin-autorizacion',
                component: SinAutorizacion,
                title: 'No autorizado',
            },

            // =====================
            // CURSOS
            // =====================

            {
                path: 'cursos',
                component: ServicioList,
                title: 'Catálogo de cursos',
            },

            {
                path: 'cursos/:id',
                component: ServicioDetail,
                title: 'Detalle del curso',
            },

            // =====================
            // PROFESIONALES PÚBLICOS
            // =====================

            {
                path: 'profesionales/:id',
                component: ProfesionalDetail,
                title: 'Detalle del profesional',
            },

            // =====================
            // ADMIN - SERVICIOS
            // =====================

            {
                path: 'admin/servicios',
                component: ServicioAdminList,
                title: 'Mantenimiento de cursos',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/servicios/crear',
                component: ServicioCreatePage,
                title: 'Registrar curso',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/servicios/editar/:id',
                component: ServicioEditPage,
                title: 'Actualizar curso',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            // =====================
            // ADMIN - USUARIOS
            // =====================

            {
                path: 'admin/usuarios',
                component: UsuariosList,
                title: 'Gestión de usuarios',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/usuarios/crear',
                component: UsuarioCreatePage,
                title: 'Registrar usuario',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/usuarios/editar/:id',
                component: UsuarioEditPage,
                title: 'Actualizar usuario',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            // =====================
            // ADMIN - PROFESIONALES
            // =====================

            {
                path: 'admin/profesionales',
                component: ProfesionalesList,
                title: 'Gestión de profesionales',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/profesionales/crear',
                component: ProfesionalCreatePage,
                title: 'Registrar profesional',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/profesionales/editar/:id',
                component: ProfesionalEditPage,
                title: 'Actualizar profesional',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            // =====================
            // ADMIN - CATEGORÍAS
            // =====================

            {
                path: 'admin/categorias',
                component: CategoriasList,
                title: 'Gestión de categorías',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            // =====================
            // ADMIN - ESPECIALIDADES
            // =====================

            {
                path: 'admin/especialidades',
                component: EspecialidadesList,
                title: 'Gestión de especialidades',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            // =====================
            // ADMIN - CITAS
            // =====================

            {
                path: 'admin/citas',
                component: CitasList,
                title: 'Gestión de citas',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/citas/crear',
                component: CitaCreatePage,
                title: 'Registrar cita',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            {
                path: 'admin/citas/:id',
                component: CitaDetail,
                title: 'Detalle de la cita',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },

            // =====================
            // ADMIN - RESEÑAS
            // =====================

            {
                path: 'admin/resenas',
                component: ResenasList,
                title: 'Gestión de reseñas',
                canActivate: [authGuard, roleGuard],
                data: {
                    roles: [Role.ADMIN],
                },
            },
        ],
    },

    {
        path: '**',
        redirectTo: '',
    },
];