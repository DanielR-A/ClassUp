import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MatOption } from "@angular/material/select";

@Component({
    selector: 'app-categorias-list',
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
    MatOption
],
    templateUrl: './categorias-list.html',
    styleUrl: './categorias-list.css',
})
export class CategoriasList implements OnInit {
    private readonly categoriaService = inject(
        CategoriaService,
    );

    categorias = signal<Categoria[]>([]);

    search = signal('');
    estadoFiltro = signal<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
    descripcionFiltro = signal('');
    loading = signal(false);
    error = signal<string | null>(null);

    displayedColumns: string[] = [
        'id',
        'categoria',
        'descripcion',
        'servicios',
        'estado',
        'fechaRegistro',
        'acciones',
    ];




categoriasFiltradas = computed(() => {
    const texto = this.search()
        .trim()
        .toLowerCase();

    const descripcionTexto = this.descripcionFiltro()
        .trim()
        .toLowerCase();

    const estado = this.estadoFiltro();

    return this.categorias().filter((categoria) => {
        const nombre =
            categoria.nombre?.toLowerCase() ?? '';

        const descripcion =
            categoria.descripcion?.toLowerCase() ?? '';

        const coincideNombre =
            !texto ||
            nombre.includes(texto);

        const coincideDescripcion =
            !descripcionTexto ||
            descripcion.includes(descripcionTexto);

        const coincideEstado =
            estado === 'TODOS' ||
            (estado === 'ACTIVOS' &&
                categoria.estado) ||
            (estado === 'INACTIVOS' &&
                !categoria.estado);

        return (
            coincideNombre &&
            coincideDescripcion &&
            coincideEstado
        );
    });
});



    totalCategorias = computed(
        () => this.categoriasFiltradas().length,
    );

    totalActivas = computed(
        () =>
            this.categorias().filter(
                (categoria) => categoria.estado,
            ).length,
    );

    totalInactivas = computed(
        () =>
            this.categorias().filter(
                (categoria) => !categoria.estado,
            ).length,
    );

    ngOnInit(): void {
        this.loadCategorias();
    }

    loadCategorias(): void {
        this.loading.set(true);
        this.error.set(null);

        this.categoriaService.listar().subscribe({
            next: (response) => {
                const categorias =
                    this.obtenerLista<Categoria>(
                        response.data,
                    );

                this.categorias.set(categorias);
                this.loading.set(false);

                console.log(
                    'Categorías cargadas:',
                    categorias,
                );
            },

            error: (error) => {
                console.error(
                    'Error al cargar categorías:',
                    error,
                );

                this.error.set(
                    'No se pudieron cargar las categorías.',
                );

                this.loading.set(false);
            },
        });
    }

    clearSearch(): void {
        this.search.set('');
        this.descripcionFiltro.set('');
        this.estadoFiltro.set('TODOS');
    }

    toggleEstado(categoria: Categoria): void {
        const nuevoEstado = !categoria.estado;

        this.categoriaService
            .cambiarEstado(
                categoria.id,
                {
                    estado: nuevoEstado,
                },
            )
            .subscribe({
                next: (response) => {
                    const categoriaActualizada =
                        response.data;

                    this.categorias.update(
                        (categorias) =>
                            categorias.map((item) =>
                                item.id === categoria.id
                                    ? {
                                        ...item,
                                        ...categoriaActualizada,
                                    }
                                    : item,
                            ),
                    );

                    console.log(
                        nuevoEstado
                            ? 'Categoría activada'
                            : 'Categoría desactivada',
                        categoriaActualizada,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error al cambiar el estado de la categoría:',
                        error,
                    );

                    this.error.set(
                        'No se pudo cambiar el estado de la categoría.',
                    );
                },
            });
    }

    getCantidadServicios(
        categoria: Categoria,
    ): number {
        return categoria.servicios?.length ?? 0;
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