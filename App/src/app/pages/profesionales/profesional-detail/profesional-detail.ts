import {
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
    Modalidad,
    PerfilProfesional,
} from '../../../core/models/perfil-profesional.model';

import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';

@Component({
    selector: 'app-profesional-detail',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './profesional-detail.html',
    styleUrl: './profesional-detail.css',
})
export class ProfesionalDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);

    private readonly profesionalService = inject(
        PerfilProfesionalService,
    );

    profesional = signal<PerfilProfesional | null>(null);

    loading = signal(false);

    error = signal<string | null>(null);

    ngOnInit(): void {
        const idParam =
            this.route.snapshot.paramMap.get('id');

        const id = Number(idParam);

        if (
            !idParam ||
            Number.isNaN(id) ||
            id <= 0
        ) {
            this.error.set(
                'El identificador del profesional no es válido.',
            );

            return;
        }

        this.loadProfesional(id);
    }

    loadProfesional(id: number): void {
        this.loading.set(true);
        this.error.set(null);

        this.profesionalService
            .obtenerPorId(id)
            .subscribe({
                next: (response) => {
                    this.profesional.set(response.data);

                    this.loading.set(false);

                    console.log(
                        'Detalle del profesional cargado:',
                        response.data,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error al cargar el profesional:',
                        error,
                    );

                    this.error.set(
                        'No se pudo cargar el detalle del profesional.',
                    );

                    this.loading.set(false);
                },
            });
    }

    getNombreCompleto(
        profesional: PerfilProfesional,
    ): string {
        const nombre =
            profesional.usuario?.nombre ?? '';

        const apellidos =
            profesional.usuario?.apellidos ?? '';

        const nombreCompleto =
            `${nombre} ${apellidos}`.trim();

        return (
            nombreCompleto ||
            'Profesional sin usuario'
        );
    }

    getUbicacion(
        profesional: PerfilProfesional,
    ): string {
        const ubicacion = [
            profesional.provincia,
            profesional.canton,
            profesional.distrito,
        ].filter(Boolean);

        return ubicacion.length > 0
            ? ubicacion.join(', ')
            : 'Ubicación no registrada';
    }

    getModalidadLabel(
        modalidad: Modalidad,
    ): string {
        const etiquetas: Record<
            Modalidad,
            string
        > = {
            VIRTUAL: 'Virtual',
            PRESENCIAL: 'Presencial',
            MIXTA: 'Mixta',
        };

        return etiquetas[modalidad];
    }

    getModalidadIcon(
        modalidad: Modalidad,
    ): string {
        const iconos: Record<
            Modalidad,
            string
        > = {
            VIRTUAL: 'videocam',
            PRESENCIAL: 'location_on',
            MIXTA: 'sync_alt',
        };

        return iconos[modalidad];
    }

    getDisponibilidadLabel(
        disponible: boolean,
    ): string {
        return disponible
            ? 'Disponible'
            : 'No disponible';
    }

    getDisponibilidadIcon(
        disponible: boolean,
    ): string {
        return disponible
            ? 'check_circle'
            : 'block';
    }

    getExperienciaLabel(
        annosExperiencia: number,
    ): string {
        return annosExperiencia === 1
            ? '1 año de experiencia'
            : `${annosExperiencia} años de experiencia`;
    }

    getImagenPerfil(
        profesional: PerfilProfesional,
    ): string {
        const imagen =
            profesional.imagenPerfil?.trim();

        if (
            !imagen ||
            imagen === 'profile-not-found.jpg'
        ) {
            return '/profile-not-found.jpg';
        }

        if (
            imagen.startsWith('http://') ||
            imagen.startsWith('https://') ||
            imagen.startsWith('/')
        ) {
            return imagen;
        }

        return `/${imagen}`;
    }
}