import {
    Component,
    inject,
    signal,
} from '@angular/core';

import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { UsuarioForm } from '../../../shared/components/usuario-form/usuario-form';
import { UsuarioService } from '../../../core/services/usuario.service';

import {
  Role,
    UsuarioCreateDto,
    UsuarioUpdateDto,
} from '../../../core/models/usuario.model';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-usuario-normal-page',
    standalone: true,
    imports: [
        UsuarioForm,
    ],
    templateUrl: './usuario-normal-page.html',
    styleUrl: './usuario-normal-page.css',
})
export class UsuarioNormalPage {

    private readonly usuarioService =
        inject(UsuarioService);

    private readonly notificationService =
        inject(NotificationService);

    private readonly router =
        inject(Router);

    saving = signal(false);

    guardar(
        data:
            | UsuarioCreateDto
            | UsuarioUpdateDto,
    ): void {

        const dto = data as UsuarioCreateDto;

        const registroDto: UsuarioCreateDto = {
            ...dto,
            role: Role.USER,
        };

        this.saving.set(true);

        this.usuarioService
            .registrar(registroDto)
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: () => {

                    this.notificationService.success(
                        'Cuenta creada correctamente',
                    );

                    this.router.navigate([
                        '/login',
                    ]);
                },

                error: (error) => {

                    console.error(
                        'Error al registrar usuario:',
                        error,
                    );
                },
            });
    }

    cancelar(): void {
        this.router.navigate([
            '/',
        ]);
    }
}