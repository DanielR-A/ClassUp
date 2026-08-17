import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { CambiarEstadoCategoriaDto, Categoria } from '../models/categoria.model';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/categoria`;

    listar() {
        return this.http.get<ApiResponse<Categoria[]>>(this.apiUrl);
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<Categoria>>(`${this.apiUrl}/${id}`);
    }




cambiarEstado(
        id: number,
        data: CambiarEstadoCategoriaDto,
    ) {
        return this.http.patch<ApiResponse<Categoria>>(
            `${this.apiUrl}/${id}/estado`,
            data,
        );
    }

}


