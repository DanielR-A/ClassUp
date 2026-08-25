import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
    Cita,
    CitaCreateDto,
    CitaUpdateDto,
} from '../models/cita.model';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/cita`;

    listar() {
        return this.http.get<
            ApiResponse<Cita[]>
        >(this.apiUrl);
    }

    obtenerPorId(id: number) {
        return this.http.get<
            ApiResponse<Cita>
        >(
            `${this.apiUrl}/${id}`,
        );
    }

    crear(data: CitaCreateDto) {
        return this.http.post<
            ApiResponse<Cita>
        >(
            this.apiUrl,
            data,
        );
    }

    actualizar(
        id: number,
        data: CitaUpdateDto,
    ) {
        return this.http.put<
            ApiResponse<Cita>
        >(
            `${this.apiUrl}/${id}`,
            data,
        );
    }

    misSolicitudes() {
        return this.http.get<
            ApiResponse<Cita[]>
        >(
            `${this.apiUrl}/mis-solicitudes`,
        );
    }

    aceptar(id: number) {
        return this.http.patch<
            ApiResponse<Cita>
        >(
            `${this.apiUrl}/${id}/aceptar`,
            {},
        );
    }

    rechazar(
        id: number,
        comentarioProfesional: string,
    ) {
        return this.http.patch<
            ApiResponse<Cita>
        >(
            `${this.apiUrl}/${id}/rechazar`,
            {
                comentarioProfesional,
            },
        );
    }

    

completar(id: number) {
    return this.http.patch<
        ApiResponse<Cita>
    >(
        `${this.apiUrl}/${id}/completar`,
        {},
    );
}
    
obtenerMiSolicitudPorId(id: number) {
    return this.http.get<ApiResponse<Cita>>(
        `${this.apiUrl}/mis-solicitudes/${id}`,
    );
}

}