import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
    PerfilProfesional,
    PerfilProfesionalCreateDto,
    PerfilProfesionalUpdateDto,
    CambiarDisponibilidadPerfilDto,
} from '../models/perfil-profesional.model';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
    providedIn: 'root',
})
export class PerfilProfesionalService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/perfilProfesional`;

    listar() {
        return this.http.get<
            ApiResponse<PerfilProfesional[]>
        >(
            this.apiUrl,
        );
    }

    obtenerPorId(id: number) {
        return this.http.get<
            ApiResponse<PerfilProfesional>
        >(
            `${this.apiUrl}/${id}`,
        );
    }

    /*
 * Obtiene el perfil profesional
 * del usuario autenticado.
 */
    obtenerMiPerfil() {
        return this.http.get<
            ApiResponse<PerfilProfesional | null>
        >(
            `${this.apiUrl}/mi-perfil`,
        );
    }


    /*
     * Crea o actualiza el perfil
     * del profesional autenticado.
     *
     * El usuarioId NO se obtiene
     * desde la URL.
     * El API lo obtiene del token JWT.
     */
    guardarMiPerfil(
        data: PerfilProfesionalCreateDto,
    ) {
        return this.http.put<
            ApiResponse<PerfilProfesional>
        >(
            `${this.apiUrl}/mi-perfil`,
            data,
        );
    }



    
    crear(
        data: PerfilProfesionalCreateDto,
    ) {
        return this.http.post<
            ApiResponse<PerfilProfesional>
        >(
            this.apiUrl,
            data,
        );
    }

    actualizar(
        id: number,
        data: PerfilProfesionalUpdateDto,
    ) {
        return this.http.put<
            ApiResponse<PerfilProfesional>
        >(
            `${this.apiUrl}/${id}`,
            data,
        );
    }

    cambiarDisponibilidad(
        id: number,
        data: CambiarDisponibilidadPerfilDto,
    ) {
        return this.http.patch<
            ApiResponse<PerfilProfesional>
        >(
            `${this.apiUrl}/${id}/disponibilidad`,
            data,
        );
    }

    /*
     * Obtiene los nombres de las imágenes
     * disponibles en Api/assets/uploads.
     *
     * Ejemplo:
     *
     * [
     *   "ana-mora.jpg",
     *   "pedro-alvarez.jpg",
     *   "profile-not-found.jpg"
     * ]
     */
    listarImagenes() {
        return this.http.get<
            ApiResponse<string[]>
        >(
            `${this.apiUrl}/imagenes`,
        );
    }




}