import {
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { finalize } from 'rxjs';

import { UsuarioForm } from '../../../shared/components/usuario-form/usuario-form';

import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';

import {
    Usuario,
    UsuarioCreateDto,
    UsuarioUpdateDto,
} from '../../../core/models/usuario.model';

@Component({
    selector: 'app-usuario-edit-page',
    standalone: true,
    imports: [
        UsuarioForm,
    ],
    templateUrl: './usuario-edit-page.html',
    styleUrl: './usuario-edit-page.css',
})
export class UsuarioEditPage implements OnInit {
    private readonly route =
        inject(ActivatedRoute);

    private readonly router =
        inject(Router);

    private readonly usuarioService =
        inject(UsuarioService);

    private readonly notificationService =
        inject(NotificationService);

    usuario = signal<Usuario | null>(null);

    loading = signal(false);
    saving = signal(false);

    ngOnInit(): void {
        this.cargarUsuario();
    }

    private cargarUsuario(): void {
        const id = Number(
            this.route.snapshot.paramMap.get('id'),
        );

        if (!Number.isInteger(id) || id <= 0) {
            this.notificationService.error(
                'El identificador del usuario no es válido',
            );

            this.router.navigate([
                '/admin/usuarios',
            ]);

            return;
        }

        this.loading.set(true);

        this.usuarioService
            .obtenerPorId(id)
            .pipe(
                finalize(() => {
                    this.loading.set(false);
                }),
            )
            .subscribe({
                next: (response) => {
                    this.usuario.set(
                        response.data,
                    );
                },

                error: (error) => {
                    console.error(
                        'Error al cargar usuario:',
                        error,
                    );

                    this.router.navigate([
                        '/admin/usuarios',
                    ]);
                },
            });
    }

    guardar(
        data:
            | UsuarioCreateDto
            | UsuarioUpdateDto,
    ): void {
        const usuarioActual =
            this.usuario();

        if (!usuarioActual) {
            return;
        }

        const dto =
            data as UsuarioUpdateDto;

        this.saving.set(true);

        this.usuarioService
            .actualizar(
                usuarioActual.id,
                dto,
            )
            .pipe(
                finalize(() => {
                    this.saving.set(false);
                }),
            )
            .subscribe({
                next: () => {
                    this.notificationService.success(
                        'Usuario actualizado correctamente',
                    );

                    this.router.navigate([
                        '/admin/usuarios',
                    ]);
                },

                error: (error) => {
                    console.error(
                        'Error al actualizar usuario:',
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