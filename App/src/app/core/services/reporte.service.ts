import {
    HttpClient,
    HttpParams,
} from '@angular/common/http';

import {
    inject,
    Injectable,
} from '@angular/core';

import {
    environment,
} from '../../../environments/environment.development';

import {
    ApiResponse,
} from '../models/api-response.model';

import {
    ReporteCalificacionProfesional,
    ReporteCitasEstado,
    ReporteCitasProfesional,
    ReporteFiltros,
} from '../models/reporte.model';


@Injectable({
    providedIn: 'root',
})
export class ReporteService {

    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/reporte`;


    /*
     * =====================================================
     * CITAS POR ESTADO
     * =====================================================
     *
     * Permite combinar:
     *
     * - fechaDesde
     * - fechaHasta
     * - profesionalId
     * - categoriaId
     */
    citasPorEstado(
        filtros:
            ReporteFiltros = {},
    ) {

        const params =
            this.buildParams(
                filtros,
            );

        return this.http.get<
            ApiResponse<
                ReporteCitasEstado
            >
        >(
            `${this.apiUrl}/citas-por-estado`,
            {
                params,
            },
        );
    }


    /*
     * =====================================================
     * CITAS COMPLETADAS POR PROFESIONAL
     * =====================================================
     */
    citasCompletadasPorProfesional() {

        return this.http.get<
            ApiResponse<
                ReporteCitasProfesional[]
            >
        >(
            `${this.apiUrl}/citas-completadas-profesional`,
        );
    }


    /*
     * =====================================================
     * CALIFICACIONES POR PROFESIONAL
     * =====================================================
     *
     * Devuelve:
     *
     * - profesionalId
     * - nombre
     * - promedio
     * - totalResenas
     */
    calificacionesPorProfesional() {

        return this.http.get<
            ApiResponse<
                ReporteCalificacionProfesional[]
            >
        >(
            `${this.apiUrl}/calificaciones-profesional`,
        );
    }


    /*
     * =====================================================
     * CONSTRUIR QUERY PARAMS
     * =====================================================
     *
     * Evita enviar parámetros vacíos
     * o valores null al API.
     */
    private buildParams(
        filtros: ReporteFiltros,
    ): HttpParams {

        let params =
            new HttpParams();

        if (
            filtros.fechaDesde
        ) {
            params =
                params.set(
                    'fechaDesde',
                    filtros.fechaDesde,
                );
        }

        if (
            filtros.fechaHasta
        ) {
            params =
                params.set(
                    'fechaHasta',
                    filtros.fechaHasta,
                );
        }

        if (
            filtros.profesionalId
        ) {
            params =
                params.set(
                    'profesionalId',
                    String(
                        filtros.profesionalId,
                    ),
                );
        }

        if (
            filtros.categoriaId
        ) {
            params =
                params.set(
                    'categoriaId',
                    String(
                        filtros.categoriaId,
                    ),
                );
        }

        return params;
    }
}
