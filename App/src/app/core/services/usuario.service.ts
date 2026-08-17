import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

import {
    CambiarEstadoUsuarioDto,
    Usuario,
    UsuarioCreateDto,
    UsuarioUpdateDto,
} from '../models/usuario.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/usuario`;

    listar() {
        return this.http.get<ApiResponse<Usuario[]>>(this.apiUrl);
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
    }

    crear(data: UsuarioCreateDto) {
        return this.http.post<ApiResponse<Usuario>>(this.apiUrl, data);
    }

    actualizar(id: number, data: UsuarioUpdateDto) {
        return this.http.put<ApiResponse<Usuario>>(
            `${this.apiUrl}/${id}`,
            data
        );
    }

    cambiarEstado(
    id: number,
    data: CambiarEstadoUsuarioDto,
) {
    return this.http.patch<ApiResponse<Usuario>>(
        `${this.apiUrl}/${id}/estado`,
        data,
    );
}

}