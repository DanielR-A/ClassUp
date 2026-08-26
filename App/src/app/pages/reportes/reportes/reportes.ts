import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import {
    FormsModule,
} from '@angular/forms';

import {
    finalize,
    forkJoin,
} from 'rxjs';

import {
    ChartComponent,
} from 'ng-apexcharts';

import type {
    ApexOptions,
} from 'apexcharts';

import {
    MatButtonModule,
} from '@angular/material/button';

import {
    MatCardModule,
} from '@angular/material/card';

import {
    MatFormFieldModule,
} from '@angular/material/form-field';

import {
    MatIconModule,
} from '@angular/material/icon';

import {
    MatInputModule,
} from '@angular/material/input';

import {
    MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

import {
    MatSelectModule,
} from '@angular/material/select';

import {
    ReporteService,
} from '../../../core/services/reporte.service';


import {
    PerfilProfesionalService,
} from '../../../core/services/perfil-profesional.service';



import {
    CategoriaService,
} from '../../../core/services/categoria.service';



import {
    ReporteCalificacionProfesional,
    ReporteCitasEstado,
    ReporteCitasProfesional,
} from '../../../core/models/reporte.model';


import {
    PerfilProfesional,
} from '../../../core/models/perfil-profesional.model';

import {
    Categoria,
} from '../../../core/models/categoria.model';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [
        FormsModule,

        ChartComponent,

        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
    ],
    templateUrl: './reportes.html',
    styleUrl: './reportes.css',
})
export class Reportes implements OnInit {

    /*
     * =====================================================
     * SERVICIOS
     * =====================================================
     */

    private readonly reporteService =
        inject(ReporteService);

    private readonly perfilProfesionalService =
        inject(
            PerfilProfesionalService,
        );

    private readonly categoriaService =
        inject(CategoriaService);


    /*
     * =====================================================
     * DATOS DE LOS REPORTES
     * =====================================================
     */

    citasPorEstado =
        signal<ReporteCitasEstado>({
            PENDIENTE: 0,
            ACEPTADA: 0,
            RECHAZADA: 0,
            CANCELADA: 0,
            COMPLETADA: 0,
            total: 0,
        });

    citasPorProfesional =
        signal<
            ReporteCitasProfesional[]
        >([]);

    calificaciones =
        signal<
            ReporteCalificacionProfesional[]
        >([]);


    /*
     * =====================================================
     * DATOS PARA FILTROS
     * =====================================================
     */

    profesionales =
        signal<
            PerfilProfesional[]
        >([]);

    categorias =
        signal<
            Categoria[]
        >([]);


    /*
     * =====================================================
     * FILTROS
     * =====================================================
     */

    fechaDesde =
        signal('');

    fechaHasta =
        signal('');

    profesionalSeleccionado =
        signal<number | null>(
            null,
        );

    categoriaSeleccionada =
        signal<number | null>(
            null,
        );


    /*
     * =====================================================
     * ESTADOS
     * =====================================================
     */

    loading =
        signal(false);

    error =
        signal<string | null>(
            null,
        );


    /*
     * =====================================================
     * RESÚMENES
     * =====================================================
     */

    totalCitas =
        computed(
            () =>
                this
                    .citasPorEstado()
                    .total,
        );

    totalCompletadas =
        computed(
            () =>
                this
                    .citasPorEstado()
                    .COMPLETADA,
        );

    totalResenas =
        computed(() =>
            this.calificaciones()
                .reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.totalResenas,
                    0,
                ),
        );

    promedioGeneral =
        computed(() => {
            const datos =
                this.calificaciones();

            const cantidad =
                datos.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.totalResenas,
                    0,
                );

            if (
                cantidad === 0
            ) {
                return 0;
            }

            const suma =
                datos.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.promedio *
                            item.totalResenas,
                    0,
                );

            return (
                suma /
                cantidad
            );
        });


    /*
     * =====================================================
     * GRÁFICO 1
     * CITAS POR ESTADO
     * =====================================================
     */

    chartCitasEstado =
        computed<
            Partial<ApexOptions>
        >(() => {

            const datos =
                this.citasPorEstado();

            return {
                chart: {
                    type: 'donut',
                    height: 340,
                    toolbar: {
                        show: false,
                    },
                },

                series: [
                    datos.PENDIENTE,
                    datos.ACEPTADA,
                    datos.RECHAZADA,
                    datos.CANCELADA,
                    datos.COMPLETADA,
                ],

                labels: [
                    'Pendientes',
                    'Aceptadas',
                    'Rechazadas',
                    'Canceladas',
                    'Completadas',
                ],

                legend: {
                    position:
                        'bottom',
                },

                dataLabels: {
                    enabled: true,
                },

                noData: {
                    text:
                        'No hay citas para mostrar',
                },

                responsive: [
                    {
                        breakpoint:
                            600,

                        options: {
                            chart: {
                                height:
                                    300,
                            },

                            legend: {
                                position:
                                    'bottom',
                            },
                        },
                    },
                ],
            };
        });


    /*
     * =====================================================
     * GRÁFICO 2
     * CITAS COMPLETADAS POR PROFESIONAL
     * =====================================================
     */

    chartCitasProfesional =
        computed<
            Partial<ApexOptions>
        >(() => {

            const datos =
                this
                    .citasPorProfesional();

            return {
                chart: {
                    type: 'bar',
                    height: 380,
                    toolbar: {
                        show: false,
                    },
                },

                series: [
                    {
                        name:
                            'Citas completadas',

                        data:
                            datos.map(
                                (
                                    item,
                                ) =>
                                    item
                                        .totalCompletadas,
                            ),
                    },
                ],

                xaxis: {
                    categories:
                        datos.map(
                            (
                                item,
                            ) =>
                                item.nombre,
                        ),
                },

                plotOptions: {
                    bar: {
                        borderRadius:
                            6,

                        columnWidth:
                            '55%',
                    },
                },

                dataLabels: {
                    enabled: true,
                },

                yaxis: {
                    min: 0,

                    forceNiceScale:
                        true,
                },

                noData: {
                    text:
                        'No hay citas completadas',
                },
            };
        });


    /*
     * =====================================================
     * GRÁFICO 3
     * CALIFICACIONES POR PROFESIONAL
     * =====================================================
     */

    chartCalificaciones =
        computed<
            Partial<ApexOptions>
        >(() => {

            const datos =
                this.calificaciones();

            return {
                chart: {
                    type: 'bar',
                    height: 380,
                    toolbar: {
                        show: false,
                    },
                },

                series: [
                    {
                        name:
                            'Promedio',

                        data:
                            datos.map(
                                (
                                    item,
                                ) =>
                                    item
                                        .promedio,
                            ),
                    },
                ],

                xaxis: {
                    categories:
                        datos.map(
                            (
                                item,
                            ) =>
                                item.nombre,
                        ),
                },

                yaxis: {
                    min: 0,
                    max: 5,

                    tickAmount:
                        5,
                },

                plotOptions: {
                    bar: {
                        borderRadius:
                            6,

                        columnWidth:
                            '55%',
                    },
                },

                dataLabels: {
                    enabled: true,

                    formatter:
                        (
                            value,
                        ) =>
                            Number(
                                value,
                            ).toFixed(
                                1,
                            ),
                },

                tooltip: {
                    y: {
                        formatter:
                            (
                                value,
                            ) =>
                                `${Number(
                                    value,
                                ).toFixed(
                                    1,
                                )} / 5`,
                    },
                },

                noData: {
                    text:
                        'No existen calificaciones',
                },
            };
        });


    /*
     * =====================================================
     * INICIO
     * =====================================================
     */

    ngOnInit(): void {
        this.cargarDatos();
    }


    /*
     * =====================================================
     * CARGA GENERAL
     * =====================================================
     */

    cargarDatos(): void {

        this.loading.set(
            true,
        );

        this.error.set(
            null,
        );

        forkJoin({
            citasEstado:
                this.reporteService
                    .citasPorEstado(),

            citasProfesional:
                this.reporteService
                    .citasCompletadasPorProfesional(),

            calificaciones:
                this.reporteService
                    .calificacionesPorProfesional(),

            profesionales:
                this.perfilProfesionalService
                    .listar(),

            categorias:
                this.categoriaService
                    .listar(),
        })
            .pipe(
                finalize(() => {
                    this.loading.set(
                        false,
                    );
                }),
            )
            .subscribe({

                next: (
                    response,
                ) => {

                    this.citasPorEstado.set(
                        response
                            .citasEstado
                            .data,
                    );

                    this.citasPorProfesional.set(
                        response
                            .citasProfesional
                            .data ??
                            [],
                    );

                    this.calificaciones.set(
                        response
                            .calificaciones
                            .data ??
                            [],
                    );


                    /*
                     * Los métodos listar()
                     * pueden devolver array
                     * directo o estructura
                     * paginada.
                     */

                    this.profesionales.set(
                        this.obtenerLista<
                            PerfilProfesional
                        >(
                            response
                                .profesionales
                                .data,
                        ),
                    );

                    this.categorias.set(
                        this.obtenerLista<
                            Categoria
                        >(
                            response
                                .categorias
                                .data,
                        ),
                    );
                },

                error: (
                    error,
                ) => {

                    console.error(
                        'Error cargando reportes:',
                        error,
                    );

                    this.error.set(
                        error
                            ?.error
                            ?.message ??
                            'No se pudieron cargar los reportes.',
                    );
                },
            });
    }


    /*
     * =====================================================
     * APLICAR FILTROS
     * =====================================================
     *
     * Actualmente los filtros del API
     * corresponden al reporte de
     * citas por estado.
     * =====================================================
     */

    aplicarFiltros(): void {

        this.loading.set(
            true,
        );

        this.error.set(
            null,
        );

        this.reporteService
            .citasPorEstado({
                fechaDesde:
                    this
                        .fechaDesde() ||
                    undefined,

                fechaHasta:
                    this
                        .fechaHasta() ||
                    undefined,

                profesionalId:
                    this
                        .profesionalSeleccionado(),

                categoriaId:
                    this
                        .categoriaSeleccionada(),
            })
            .pipe(
                finalize(() => {
                    this.loading.set(
                        false,
                    );
                }),
            )
            .subscribe({

                next: (
                    response,
                ) => {

                    this.citasPorEstado.set(
                        response.data,
                    );
                },

                error: (
                    error,
                ) => {

                    console.error(
                        'Error aplicando filtros:',
                        error,
                    );

                    this.error.set(
                        error
                            ?.error
                            ?.message ??
                            'No se pudo actualizar el reporte.',
                    );
                },
            });
    }


    /*
     * =====================================================
     * LIMPIAR FILTROS
     * =====================================================
     */

    clearFilters(): void {

        this.fechaDesde.set(
            '',
        );

        this.fechaHasta.set(
            '',
        );

        this.profesionalSeleccionado.set(
            null,
        );

        this.categoriaSeleccionada.set(
            null,
        );

        this.aplicarFiltros();
    }


    /*
     * =====================================================
     * NOMBRE PROFESIONAL
     * =====================================================
     */

    getNombreProfesional(
        profesional:
            PerfilProfesional,
    ): string {

        const nombre =
            profesional.usuario
                ?.nombre ??
            '';

        const apellidos =
            profesional.usuario
                ?.apellidos ??
            '';

        return (
            `${nombre} ${apellidos}`.trim() ||
            profesional
                .tituloProfesional ||
            'Profesional'
        );
    }


    /*
     * =====================================================
     * OBTENER LISTA
     * =====================================================
     */

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

        if (
            Array.isArray(
                data,
            )
        ) {
            return data;
        }

        if (
            data &&
            typeof data ===
                'object' &&
            'data' in data &&
            Array.isArray(
                data.data,
            )
        ) {
            return data.data;
        }

        return [];
    }
}