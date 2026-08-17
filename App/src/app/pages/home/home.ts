import {
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PerfilProfesionalService } from '../../core/services/perfil-profesional.service';
import { CitaService } from '../../core/services/cita.service';
import { UsuarioService } from '../../core/services/usuario.service';

import { PerfilProfesional } from '../../core/models/perfil-profesional.model';
import { Cita } from '../../core/models/cita.model';
import { Usuario } from '../../core/models/usuario.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        RouterLink,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {
    private readonly profesionalService = inject(
        PerfilProfesionalService,
    );

    private readonly citaService = inject(
        CitaService,
    );

    private readonly usuarioService = inject(
        UsuarioService,
    );

    profesionales = signal<PerfilProfesional[]>([]);

    citas = signal<Cita[]>([]);

    usuarios = signal<Usuario[]>([]);

    loading = signal(true);

    error = signal<string | null>(null);

    totalProfesionales = computed(
        () => this.profesionales().length,
    );

    totalCitas = computed(
        () => this.citas().length,
    );

    totalCitasPendientes = computed(
        () =>
            this.citas().filter(
                (cita) =>
                    cita.estado === 'PENDIENTE',
            ).length,
    );

    totalUsuarios = computed(
        () => this.usuarios().length,
    );

    profesionalesDisponibles = computed(
        () =>
            this.profesionales()
                .filter(
                    (profesional) =>
                        profesional.disponible,
                )
                .slice(0, 4),
    );

    constructor() {
        this.cargarDashboard();
    }

    cargarDashboard(): void {
        this.loading.set(true);
        this.error.set(null);

        forkJoin({
            profesionales:
                this.profesionalService.listar(),

            citas:
                this.citaService.listar(),

            usuarios:
                this.usuarioService.listar(),
        })
            .pipe(
                finalize(() => {
                    this.loading.set(false);
                }),
            )
            .subscribe({
                next: ({
                    profesionales,
                    citas,
                    usuarios,
                }) => {
                    this.profesionales.set(
                        this.obtenerLista<PerfilProfesional>(
                            profesionales.data,
                        ),
                    );

                    this.citas.set(
                        this.obtenerLista<Cita>(
                            citas.data,
                        ),
                    );

                    this.usuarios.set(
                        this.obtenerLista<Usuario>(
                            usuarios.data,
                        ),
                    );
                },

                error: (error) => {
                    console.error(
                        'Error cargando el dashboard:',
                        error,
                    );

                    this.error.set(
                        'No se pudo cargar la información principal.',
                    );
                },
            });
    }

    getNombreProfesional(
        profesional: PerfilProfesional,
    ): string {
        const nombre =
            profesional.usuario?.nombre ?? '';

        const apellidos =
            profesional.usuario?.apellidos ?? '';

        return (
            `${nombre} ${apellidos}`.trim() ||
            'Profesional'
        );
    }

    getIniciales(
        profesional: PerfilProfesional,
    ): string {
        const nombre =
            profesional.usuario?.nombre?.trim() ??
            '';

        const apellidos =
            profesional.usuario?.apellidos?.trim() ??
            '';

        const primeraInicial =
            nombre.charAt(0).toUpperCase();

        const segundaInicial =
            apellidos.charAt(0).toUpperCase();

        return (
            `${primeraInicial}${segundaInicial}` ||
            'PR'
        );
    }

    private obtenerLista<T>(
        data:
            | T[]
            | {
                  data: T[];
                  meta?: unknown;
              }
            | null
            | undefined,
    ): T[] {
        if (Array.isArray(data)) {
            return data;
        }

        if (
            data &&
            typeof data === 'object' &&
            'data' in data &&
            Array.isArray(data.data)
        ) {
            return data.data;
        }

        return [];
    }
}