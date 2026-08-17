import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Resena } from '../../../core/models/resena.model';
import { ResenaService } from '../../../core/services/resena.service';

@Component({
    selector: 'app-resenas-list',
    standalone: true,
    imports: [
        FormsModule,
        DatePipe,
        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTableModule,
    ],
    templateUrl: './resenas-list.html',
    styleUrl: './resenas-list.css',
})
export class ResenasList implements OnInit {
    private readonly resenaService = inject(ResenaService);

    resenas = signal<Resena[]>([]);

    search = signal('');
    puntuacionSeleccionada = signal<number | null>(null);

    loading = signal(false);
    error = signal<string | null>(null);

    readonly puntuaciones = [5, 4, 3, 2, 1];

    displayedColumns: string[] = [
        'id',
        'cliente',
        'profesional',
        'puntuacion',
        'comentario',
        'fecha',
    ];

    resenasFiltradas = computed(() => {
        const texto = this.search()
            .trim()
            .toLowerCase();

        const puntuacion =
            this.puntuacionSeleccionada();

        return this.resenas().filter((resena) => {
            const comentario =
                resena.comentario?.toLowerCase() ?? '';

            const clienteNombre =
                resena.cliente
                    ? `${resena.cliente.nombre ?? ''} ${
                          resena.cliente.apellidos ?? ''
                      }`
                          .trim()
                          .toLowerCase()
                    : '';

            const profesionalNombre =
                resena.profesional?.usuario
                    ? `${resena.profesional.usuario.nombre ?? ''} ${
                          resena.profesional.usuario.apellidos ?? ''
                      }`
                          .trim()
                          .toLowerCase()
                    : '';

            const coincideTexto =
                texto.length === 0 ||
                comentario.includes(texto) ||
                clienteNombre.includes(texto) ||
                profesionalNombre.includes(texto);

            const coincidePuntuacion =
                puntuacion === null ||
                resena.puntuacion === puntuacion;

            return coincideTexto && coincidePuntuacion;
        });
    });

    totalResenas = computed(
        () => this.resenasFiltradas().length,
    );

    promedioPuntuacion = computed(() => {
        const resenas = this.resenas();

        if (resenas.length === 0) {
            return 0;
        }

        const total = resenas.reduce(
            (acumulado, resena) =>
                acumulado + resena.puntuacion,
            0,
        );

        return total / resenas.length;
    });

    ngOnInit(): void {
        this.loadResenas();
    }

    loadResenas(): void {
        this.loading.set(true);
        this.error.set(null);

        this.resenaService.listar().subscribe({
            next: (response) => {
                const resenas =
                    this.obtenerLista<Resena>(
                        response.data,
                    );

                this.resenas.set(resenas);
                this.loading.set(false);

                console.log(
                    'Reseñas cargadas:',
                    resenas,
                );
            },
            error: (error) => {
                console.error(
                    'Error al cargar reseñas:',
                    error,
                );

                this.error.set(
                    'No se pudieron cargar las reseñas.',
                );

                this.loading.set(false);
            },
        });
    }

    clearFilters(): void {
        this.search.set('');
        this.puntuacionSeleccionada.set(null);
    }

    getEstrellas(puntuacion: number): number[] {
        return Array.from(
            { length: puntuacion },
            (_, index) => index,
        );
    }

    getEstrellasVacias(
        puntuacion: number,
    ): number[] {
        return Array.from(
            { length: Math.max(0, 5 - puntuacion) },
            (_, index) => index,
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