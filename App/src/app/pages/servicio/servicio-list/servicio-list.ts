import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ServicioService } from '../../../core/services/servicio.service';
import { Servicio } from '../../../core/models/servicio.model';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
    selector: 'app-servicio-list',
    standalone: true,
    imports: [
        FormsModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
    ],
    templateUrl: './servicio-list.html',
    styleUrl: './servicio-list.css',
})
export class ServicioList implements OnInit {
    private readonly servicioService = inject(ServicioService);

    // Listado completo de servicios
    servicios = signal<Servicio[]>([]);

    // Filtro de búsqueda
    search = signal('');

    // Categoría seleccionada
    categoriaId = signal<number | null>(null);

    // Indica si se está esperando respuesta del API
    loading = signal(false);

    // Mensaje de error del API
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadServicios();
    }

    loadServicios(): void {
        this.loading.set(true);
        this.error.set(null);

        this.servicioService.listar().subscribe({
            next: (response) => {
                console.log('Respuesta de servicios:', response);

                this.servicios.set(response.data);
                this.loading.set(false);

                console.log('Servicios cargados:', response.data);
            },
            error: (error) => {
                console.error('Error al cargar servicios:', error);

                this.error.set(
                    'No se pudieron cargar los servicios.',
                );

                this.loading.set(false);
            },
        });
    }

    categorias = computed<Categoria[]>(() => {
        const mapa = new Map<number, Categoria>();

        this.servicios().forEach((servicio) => {
            if (servicio.categoria) {
                mapa.set(
                    servicio.categoria.id,
                    servicio.categoria,
                );
            }
        });

        return Array.from(mapa.values());
    });

    serviciosFiltrados = computed(() => {
        const texto = this.search().trim().toLowerCase();
        const categoriaSeleccionada = this.categoriaId();

        return this.servicios().filter((servicio) => {
            const nombre =
                servicio.nombre?.toLowerCase() ?? '';

            const descripcion =
                servicio.descripcion?.toLowerCase() ?? '';

            const categoriaNombre =
                servicio.categoria?.nombre
                    ?.toLowerCase() ?? '';

            const profesionalNombre =
                servicio.profesional?.usuario
                    ? `${servicio.profesional.usuario.nombre ?? ''} ${
                          servicio.profesional.usuario.apellidos ?? ''
                      }`
                          .trim()
                          .toLowerCase()
                    : '';

            const coincideTexto =
                texto.length === 0 ||
                nombre.includes(texto) ||
                descripcion.includes(texto) ||
                categoriaNombre.includes(texto) ||
                profesionalNombre.includes(texto);

            const coincideCategoria =
                categoriaSeleccionada === null ||
                categoriaSeleccionada === undefined ||
                servicio.categoriaId ===
                    categoriaSeleccionada ||
                servicio.categoria?.id ===
                    categoriaSeleccionada;

            return coincideTexto && coincideCategoria;
        });
    });

    totalServicios = computed(
        () => this.serviciosFiltrados().length,
    );

    clearFilters(): void {
        this.search.set('');
        this.categoriaId.set(null);
    }
}