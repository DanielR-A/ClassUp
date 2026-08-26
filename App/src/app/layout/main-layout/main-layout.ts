import {
    Component,
    signal,
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import {
    Header,
    MenuItem,
} from '../header/header';

import { Footer } from '../footer/footer';

import { Role } from '../../core/models/usuario.model';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        Header,
        Footer,
    ],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css',
})
export class MainLayout {

    readonly cartCount = signal(0);

    /*
     * MENÚ PRINCIPAL
     */
    readonly publicMenu: MenuItem[] = [
        {
            label: 'Inicio',
            path: '/',
            icon: 'home',
        },
        {
            label: 'Cursos',
            path: '/cursos',
            icon: 'school',
        },

        {
            label: 'Crear cuenta',
            path: '/registro',
            icon: 'person_add',
        },
        {
            label: 'Mi Agenda',
            path: '/mis-citas',
            icon: 'calendar_month',
            roles: [
                Role.USER,

            ],
        },

        {
            label: 'Solicitar cita',
            path: '/solicitar-cita',
            icon: 'event_available',
            roles: [
                Role.USER,
            ],
        },

        {
            label: 'Solicitudes',
            path: '/profesional/solicitudes',
            icon: 'event_available',
            roles: [
                Role.PROFESIONAL,
            ],
        },

        {
            label: 'Agenda',
            path: '/agenda',
            icon: 'calendar_view_week',
            roles: [
                Role.USER,
                Role.PROFESIONAL,
                Role.ADMIN,
            ],
        },

    ];

    /*
     * MANTENIMIENTOS ADMINISTRATIVOS
     */
    readonly adminMaintenanceMenu: MenuItem[] = [
        {
            label: 'Usuarios',
            path: '/admin/usuarios',
            icon: 'group',
            roles: [Role.ADMIN],
        },
        {
            label: 'Profesionales',
            path: '/admin/profesionales',
            icon: 'school',
            roles: [Role.ADMIN],
        },
        {
            label: 'Categorías',
            path: '/admin/categorias',
            icon: 'category',
            roles: [Role.ADMIN],
        },
        {
            label: 'Especialidades',
            path: '/admin/especialidades',
            icon: 'workspace_premium',
            roles: [Role.ADMIN],
        },
        {
            label: 'Cursos',
            path: '/admin/servicios',
            icon: 'menu_book',
            roles: [Role.ADMIN],
        },
    ];

    /*
     * GESTIÓN ADMINISTRATIVA
     */
    readonly adminManagementMenu: MenuItem[] = [
        {
            label: 'Citas',
            path: '/admin/citas',
            icon: 'event',
            roles: [Role.ADMIN],
        },
        {
            label: 'Reseñas',
            path: '/admin/resenas',
            icon: 'reviews',
            roles: [Role.ADMIN],
        },
    ];
}