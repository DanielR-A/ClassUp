import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment.development';

import {
    Especialidad,
    EspecialidadCreateDto,
    EspecialidadUpdateDto,
    CambiarEstadoEspecialidadDto,
} from '../models/especialidad.model';

import { ApiResponse } from '../models/api-response.model';

@Injectable({
    providedIn: 'root',
})
export class EspecialidadService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/especialidad`;

    listar() {
        return this.http.get<ApiResponse<Especialidad[]>>(
            this.apiUrl,
        );
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<Especialidad>>(
            `${this.apiUrl}/${id}`,
        );
    }

    crear(data: EspecialidadCreateDto) {
        return this.http.post<ApiResponse<Especialidad>>(
            this.apiUrl,
            data,
        );
    }

    actualizar(
        id: number,
        data: EspecialidadUpdateDto,
    ) {
        return this.http.put<ApiResponse<Especialidad>>(
            `${this.apiUrl}/${id}`,
            data,
        );
    }

    cambiarEstado(
        id: number,
        data: CambiarEstadoEspecialidadDto,
    ) {
        return this.http.patch<ApiResponse<Especialidad>>(
            `${this.apiUrl}/${id}/estado`,
            data,
        );
    }
}