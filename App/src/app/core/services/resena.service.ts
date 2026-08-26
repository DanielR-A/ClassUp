import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';

import {
    Resena,
    ResenaCreateDto,
    ResenaUpdateDto,
} from '../models/resena.model';

@Injectable({
    providedIn: 'root',
})
export class ResenaService {
    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/resena`;

    listar() {
        return this.http.get<
            ApiResponse<Resena[]>
        >(
            this.apiUrl,
        );
    }

    obtenerPorId(id: number) {
        return this.http.get<
            ApiResponse<Resena>
        >(
            `${this.apiUrl}/${id}`,
        );
    }

    crear(data: ResenaCreateDto) {
        return this.http.post<
            ApiResponse<Resena>
        >(
            this.apiUrl,
            data,
        );
    }

    actualizar(
        id: number,
        data: ResenaUpdateDto,
    ) {
        return this.http.put<
            ApiResponse<Resena>
        >(
            `${this.apiUrl}/${id}`,
            data,
        );
    }
}