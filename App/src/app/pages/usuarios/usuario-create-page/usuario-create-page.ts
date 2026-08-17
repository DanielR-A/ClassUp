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
    UsuarioCreateDto,
    UsuarioUpdateDto,
} from '../../../core/models/usuario.model';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-usuario-create-page',
    standalone: true,
    imports: [
        UsuarioForm,
    ],
    templateUrl: './usuario-create-page.html',
    styleUrl: './usuario-create-page.css',
})
export class UsuarioCreatePage {
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

        this.saving.set(true);

        this.usuarioService
            .crear(dto)
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: () => {
                    this.notificationService.success(
                        'Usuario registrado correctamente',
                    );

                    this.router.navigate([
                        '/admin/usuarios',
                    ]);
                },

                error: (error) => {
                    console.error(
                        'Error al crear usuario:',
                        error,
                    );
                },
            });
    }

    cancelar(): void {
        this.router.navigate([
            '/admin/usuarios',
        ]);
    }
}