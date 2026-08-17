
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Servicio } from '../../../core/models/servicio.model';
import { ServicioService } from '../../../core/services/servicio.service';
import { computed, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { QRCodeComponent } from 'angularx-qrcode'; //QR

@Component({
    selector: 'app-servicio-detail',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        QRCodeComponent, //QR
    ],
    templateUrl: './servicio-detail.html',
    styleUrl: './servicio-detail.css',
})
export class ServicioDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly servicioService = inject(ServicioService);

    servicio = signal<Servicio | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);


    //QR  
   qrValue = computed(() => {
    const servicioActual = this.servicio();

    if (!servicioActual?.id) {
        return '';
    }

    const profesional =
        servicioActual.profesional?.usuario;

    return [
        'CLASSUP - DETALLE DEL CURSO',
        `Código: CURSO-${servicioActual.id
            .toString()
            .padStart(5, '0')}`,
        `Curso: ${servicioActual.nombre}`,
        `Descripción: ${servicioActual.descripcion}`,
        `Precio: ₡${servicioActual.precio}`,
        `Duración: ${servicioActual.duracionMinutos} minutos`,
        `Modalidad: ${this.getModalidadLabel(
            servicioActual.modalidad,
        )}`,
        `Profesional: ${
            profesional
                ? `${profesional.nombre} ${profesional.apellidos}`
                : 'No disponible'
        }`,
        `Categoría: ${
            servicioActual.categoria?.nombre ??
            'Sin categoría'
        }`,
    ].join('\n');
});













    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        const id = Number(idParam);

        if (!idParam || Number.isNaN(id) || id <= 0) {
            this.error.set(
                'El identificador del servicio no es válido.',
            );
            return;
        }

        this.loadServicio(id);
    }

    loadServicio(id: number): void {
        this.loading.set(true);
        this.error.set(null);

        this.servicioService.obtenerPorId(id).subscribe({
            next: (response) => {
                this.servicio.set(response.data);
                this.loading.set(false);

                console.log(
                    'Detalle del servicio cargado:',
                    response.data,
                );
            },
            error: (error) => {
                console.error(
                    'Error al cargar el servicio:',
                    error,
                );

                this.error.set(
                    'No se pudo cargar el detalle del servicio.',
                );

                this.loading.set(false);
            },
        });
    }

    getModalidadLabel(
        modalidad: Servicio['modalidad'],
    ): string {
        const etiquetas: Record<
            Servicio['modalidad'],
            string
        > = {
            VIRTUAL: 'Virtual',
            PRESENCIAL: 'Presencial',
            MIXTA: 'Mixta',
        };

        return etiquetas[modalidad];
    }

    getModalidadIcon(
        modalidad: Servicio['modalidad'],
    ): string {
        const iconos: Record<
            Servicio['modalidad'],
            string
        > = {
            VIRTUAL: 'videocam',
            PRESENCIAL: 'location_on',
            MIXTA: 'sync_alt',
        };

        return iconos[modalidad];
    }
}