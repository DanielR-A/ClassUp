import {
    Component,
    computed,
    effect,
    input,
    output,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    FormField,
    form,
    required,
    min,
    minLength,
    maxLength,
    validate,
    pattern,
} from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
//MASK
import { NgxMaskDirective } from 'ngx-mask';

import {
    Modalidad,
    PerfilProfesional,
    PerfilProfesionalCreateDto,
    PerfilProfesionalUpdateDto,
} from '../../../core/models/perfil-profesional.model';

import { Especialidad } from '../../../core/models/especialidad.model';
import { Usuario } from '../../../core/models/usuario.model';

interface ProfesionalFormModel {
    usuarioId: number | null;
    tituloProfesional: string;
    descripcion: string;
    annosExperiencia: number;
    modalidad: Modalidad;
    provincia: string;
    canton: string;
    distrito: string;
    tarifaBase: number;
    disponible: boolean;
    imagenPerfil: string;
    especialidadIds: number[];
}

@Component({
    selector: 'app-profesional-form',
    standalone: true,
    imports: [
        CommonModule,
         FormsModule,   // <-- 
        FormField,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        NgxMaskDirective,
    ],
    templateUrl: './profesional-form.html',
    styleUrl: './profesional-form.css',
})
export class ProfesionalForm {
    /*
     * Profesional que se editará.
     * Cuando es null, el formulario funciona en modo creación.
     */
    profesional = input<PerfilProfesional | null>(null);

    /*
     * Datos para los campos de selección.
     */
    usuarios = input<Usuario[]>([]);
    especialidades = input<Especialidad[]>([]);

    /*
     * Indica si el componente padre está guardando.
     */
    saving = input<boolean>(false);

    /*
     * Eventos enviados al componente padre.
     */
    guardar = output<
        | PerfilProfesionalCreateDto
        | PerfilProfesionalUpdateDto
    >();

    cancelar = output<void>();

    /*
     * Modalidades permitidas por Prisma.
     */
    readonly modalidades: {
        value: Modalidad;
        label: string;
        icon: string;
    }[] = [
        {
            value: 'VIRTUAL',
            label: 'Virtual',
            icon: 'videocam',
        },
        {
            value: 'PRESENCIAL',
            label: 'Presencial',
            icon: 'location_on',
        },
        {
            value: 'MIXTA',
            label: 'Mixta',
            icon: 'sync_alt',
        },
    ];

    /*
     * Solo muestra usuarios con rol PROFESIONAL.
     * En edición conserva visible al usuario actualmente asociado.
     */
 usuariosProfesionales = computed(() => {
    const usuarioActualId =
        this.profesional()?.usuarioId;

    return this.usuarios().filter(
        (usuario) => {
            // En edición debemos conservar visible
            // el usuario asociado al perfil actual.
            if (usuario.id === usuarioActualId) {
                return true;
            }

            // En creación solamente mostramos
            // profesionales activos y sin perfil.
            return (
                usuario.role === 'PROFESIONAL' &&
                usuario.estado === true &&
                !usuario.perfilProfesional
            );
        },
    );
});

    /*
     * Estado principal del formulario.
     */
    profesionalModel = signal<ProfesionalFormModel>({
        usuarioId: null,
        tituloProfesional: '',
        descripcion: '',
        annosExperiencia: 0,
        modalidad: 'VIRTUAL',
        provincia: '',
        canton: '',
        distrito: '',
        tarifaBase: 0,
        disponible: true,
        imagenPerfil: 'profile-not-found.jpg',
        especialidadIds: [],
    });

    /*
     * Formulario basado en Signals.
     */
    profesionalForm = form(
        this.profesionalModel,
        (path) => {
            /*
             * Usuario
             */
            required(path.usuarioId, {
                message:
                    'Seleccione el usuario del profesional',
            });

            validate(path.usuarioId, (ctx) => {
                const usuarioId = Number(ctx.value());

                if (
                    ctx.value() !== null &&
                    (!Number.isInteger(usuarioId) ||
                        usuarioId <= 0)
                ) {
                    return {
                        kind: 'usuarioInvalido',
                        message:
                            'El usuario seleccionado no es válido',
                    };
                }

                return undefined;
            });

            /*
             * Título profesional
             */
            required(path.tituloProfesional, {
                message:
                    'El título profesional es obligatorio',
            });

            minLength(path.tituloProfesional, 3, {
                message:
                    'El título debe contener al menos 3 caracteres',
            });

            maxLength(path.tituloProfesional, 150, {
                message:
                    'El título no puede superar los 150 caracteres',
            });

            pattern(
                path.tituloProfesional,
                /^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s:'\-&.,()]+$/,
                {
                    message:
                        'El título contiene caracteres no permitidos',
                },
            );

            validate(
                path.tituloProfesional,
                (ctx) => {
                    const titulo =
                        ctx.value().trim();

                    if (
                        titulo.length > 0 &&
                        titulo === titulo.toUpperCase()
                    ) {
                        return {
                            kind: 'tituloMayusculas',
                            message:
                                'No escriba todo el título en mayúsculas',
                        };
                    }

                    return undefined;
                },
            );

            /*
             * Descripción
             */
            required(path.descripcion, {
                message:
                    'La descripción es obligatoria',
            });

            minLength(path.descripcion, 20, {
                message:
                    'La descripción debe contener al menos 20 caracteres',
            });

            maxLength(path.descripcion, 500, {
                message:
                    'La descripción no puede superar los 500 caracteres',
            });

            validate(path.descripcion, (ctx) => {
                const descripcion =
                    ctx.value().trim();

                if (
                    descripcion.length > 0 &&
                    descripcion.split(/\s+/).length < 5
                ) {
                    return {
                        kind: 'descripcionCorta',
                        message:
                            'La descripción debe contener al menos 5 palabras',
                    };
                }

                return undefined;
            });

            /*
             * Años de experiencia
             */
            required(path.annosExperiencia, {
                message:
                    'Los años de experiencia son obligatorios',
            });

            min(path.annosExperiencia, 0, {
                message:
                    'Los años de experiencia no pueden ser negativos',
            });

            validate(
                path.annosExperiencia,
                (ctx) => {
                    const annos = Number(ctx.value());

                    if (!Number.isInteger(annos)) {
                        return {
                            kind: 'experienciaEntera',
                            message:
                                'Los años de experiencia deben ser un número entero',
                        };
                    }

                    if (annos > 60) {
                        return {
                            kind: 'experienciaExcesiva',
                            message:
                                'Los años de experiencia no pueden superar 60',
                        };
                    }

                    return undefined;
                },
            );

            /*
             * Modalidad
             */
            required(path.modalidad, {
                message:
                    'Seleccione una modalidad',
            });

            validate(path.modalidad, (ctx) => {
                const modalidadesValidas: Modalidad[] =
                    [
                        'VIRTUAL',
                        'PRESENCIAL',
                        'MIXTA',
                    ];

                if (
                    !modalidadesValidas.includes(
                        ctx.value(),
                    )
                ) {
                    return {
                        kind: 'modalidadInvalida',
                        message:
                            'La modalidad seleccionada no es válida',
                    };
                }

                return undefined;
            });

            /*
             * Provincia
             */
            required(path.provincia, {
                message:
                    'La provincia es obligatoria',
            });

            minLength(path.provincia, 2, {
                message:
                    'La provincia debe contener al menos 2 caracteres',
            });

            maxLength(path.provincia, 100, {
                message:
                    'La provincia no puede superar los 100 caracteres',
            });

            pattern(
                path.provincia,
                /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s\-]+$/,
                {
                    message:
                        'La provincia solo puede contener letras',
                },
            );

            /*
             * Cantón
             */
            required(path.canton, {
                message: 'El cantón es obligatorio',
            });

            minLength(path.canton, 2, {
                message:
                    'El cantón debe contener al menos 2 caracteres',
            });

            maxLength(path.canton, 100, {
                message:
                    'El cantón no puede superar los 100 caracteres',
            });

            pattern(
                path.canton,
                /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s\-]+$/,
                {
                    message:
                        'El cantón solo puede contener letras',
                },
            );

            /*
             * Distrito
             */
            required(path.distrito, {
                message:
                    'El distrito es obligatorio',
            });

            minLength(path.distrito, 2, {
                message:
                    'El distrito debe contener al menos 2 caracteres',
            });

            maxLength(path.distrito, 100, {
                message:
                    'El distrito no puede superar los 100 caracteres',
            });

            pattern(
                path.distrito,
                /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s\-]+$/,
                {
                    message:
                        'El distrito solo puede contener letras',
                },
            );

            /*
             * Tarifa base
             */
            required(path.tarifaBase, {
                message:
                    'La tarifa base es obligatoria',
            });

           

            validate(path.tarifaBase, (ctx) => {
                const tarifa = Number(ctx.value());

                if (!Number.isFinite(tarifa)) {
                    return {
                        kind: 'tarifaInvalida',
                        message:
                            'Ingrese una tarifa válida',
                    };
                }

                if (tarifa > 1000000) {
                    return {
                        kind: 'tarifaExcesiva',
                        message:
                            'La tarifa no puede superar ₡1 000 000',
                    };
                }

                return undefined;
            });

            /*
             * Imagen de perfil
             */
            maxLength(path.imagenPerfil, 255, {
                message:
                    'La ruta de la imagen no puede superar los 255 caracteres',
            });

            validate(path.imagenPerfil, (ctx) => {
                const imagen = ctx.value().trim();

                if (
                    imagen.length > 0 &&
                    !/\.(jpg|jpeg|png|webp)$/i.test(
                        imagen,
                    )
                ) {
                    return {
                        kind: 'imagenInvalida',
                        message:
                            'La imagen debe tener extensión JPG, JPEG, PNG o WEBP',
                    };
                }

                return undefined;
            });

            /*
             * Especialidades
             */
            validate(
                path.especialidadIds,
                (ctx) => {
                    const ids = ctx.value();

                    if (!ids || ids.length === 0) {
                        return {
                            kind: 'especialidadRequerida',
                            message:
                                'Seleccione al menos una especialidad',
                        };
                    }

                    return undefined;
                },
            );

            validate(
                path.especialidadIds,
                (ctx) => {
                    const contieneIdInvalido =
                        ctx.value().some(
                            (id) =>
                                !Number.isInteger(
                                    Number(id),
                                ) ||
                                Number(id) <= 0,
                        );

                    if (contieneIdInvalido) {
                        return {
                            kind: 'especialidadInvalida',
                            message:
                                'Una de las especialidades seleccionadas no es válida',
                        };
                    }

                    return undefined;
                },
            );
        },
    );

    /*
     * Indica si se está editando.
     */
    isEdit = computed(
        () => this.profesional() !== null,
    );


//MASK
// computed() crea un valor calculado en Angular Signals.
//Cada vez que cambie this.profesional(), 
// este código se vuelve a ejecutar automáticamente.
    codigoProfesional = computed(() => {
    const profesionalActual = this.profesional();

    //Cuando estás creando un profesional todavía no existe un ID,
    //  porque aún no se ha guardado en la base de datos.
    if (!profesionalActual?.id) {
        return 'Se generará al registrar';
    }

    return `PRO-${profesionalActual.id
        .toString()
        //Completa con ceros a la izquierda hasta tener 5 dígitos.
        .padStart(5, '0')}`;
});











    /*
     * Deshabilita el envío mientras el padre guarda.
     */
    isSubmitting = computed(
        () => this.saving(),
    );

    constructor() {
        /*
         * Carga los datos cuando cambia el profesional recibido.
         */
        effect(() => {
            const profesionalActual =
                this.profesional();

            if (!profesionalActual) {
                this.resetForm();
                return;
            }

            this.profesionalModel.set({
                usuarioId:
                    profesionalActual.usuarioId ??
                    null,

                tituloProfesional:
                    profesionalActual
                        .tituloProfesional ?? '',

                descripcion:
                    profesionalActual.descripcion ??
                    '',

                annosExperiencia:
                    profesionalActual
                        .annosExperiencia ?? 0,

                modalidad:
                    profesionalActual.modalidad ??
                    'VIRTUAL',

                provincia:
                    profesionalActual.provincia ?? '',

                canton:
                    profesionalActual.canton ?? '',

                distrito:
                    profesionalActual.distrito ?? '',

                tarifaBase: Number(
                    profesionalActual.tarifaBase ?? 0,
                ),

                disponible:
                    profesionalActual.disponible ??
                    true,

                imagenPerfil:
                    profesionalActual.imagenPerfil ??
                    'profile-not-found.jpg',

                especialidadIds:
                    profesionalActual.especialidades
                        ?.map(
                            (especialidad) =>
                                especialidad.id,
                        ) ?? [],
            });
        });
    }

    /*
     * Limpia el formulario en modo creación.
     */
    private resetForm(): void {
        this.profesionalModel.set({
            usuarioId: null,
            tituloProfesional: '',
            descripcion: '',
            annosExperiencia: 0,
            modalidad: 'VIRTUAL',
            provincia: '',
            canton: '',
            distrito: '',
            tarifaBase: 0,
            disponible: true,
            imagenPerfil:
                'profile-not-found.jpg',
            especialidadIds: [],
        });
    }

    /*
     * Agrega o elimina una especialidad.
     */
    toggleEspecialidad(
        id: number,
        checked: boolean,
    ): void {
        this.profesionalModel.update(
            (value) => ({
                ...value,

                especialidadIds: checked
                    ? Array.from(
                          new Set([
                              ...value.especialidadIds,
                              id,
                          ]),
                      )
                    : value.especialidadIds.filter(
                          (especialidadId) =>
                              especialidadId !== id,
                      ),
            }),
        );

        this.profesionalForm
            .especialidadIds()
            .markAsTouched();
    }

    /*
     * Indica si una especialidad está seleccionada.
     */
    isEspecialidadSelected(
        id: number,
    ): boolean {
        return this.profesionalModel()
            .especialidadIds.includes(id);
    }

    /*
     * Ejecutado por el botón Guardar.
     */
    submit(): void {
        if (this.isSubmitting()) {
            return;
        }

        this.marcarCamposComoTocados();

        if (this.formularioInvalido()) {
            return;
        }

        this.emitirGuardar();
    }

    /*
     * Envía el evento de cancelación.
     */
    cancelarFormulario(): void {
        this.cancelar.emit();
    }

    /*
     * Marca los campos para mostrar validaciones.
     */
    private marcarCamposComoTocados(): void {
        this.profesionalForm
            .usuarioId()
            .markAsTouched();

        this.profesionalForm
            .tituloProfesional()
            .markAsTouched();

        this.profesionalForm
            .descripcion()
            .markAsTouched();

        this.profesionalForm
            .annosExperiencia()
            .markAsTouched();

        this.profesionalForm
            .modalidad()
            .markAsTouched();

        this.profesionalForm
            .provincia()
            .markAsTouched();

        this.profesionalForm
            .canton()
            .markAsTouched();

        this.profesionalForm
            .distrito()
            .markAsTouched();

        this.profesionalForm
            .tarifaBase()
            .markAsTouched();

        this.profesionalForm
            .imagenPerfil()
            .markAsTouched();

        this.profesionalForm
            .especialidadIds()
            .markAsTouched();
    }

    /*
     * Comprueba si algún campo es inválido.
     */
    private formularioInvalido(): boolean {
        return (
            this.profesionalForm
                .usuarioId()
                .invalid() ||
            this.profesionalForm
                .tituloProfesional()
                .invalid() ||
            this.profesionalForm
                .descripcion()
                .invalid() ||
            this.profesionalForm
                .annosExperiencia()
                .invalid() ||
            this.profesionalForm
                .modalidad()
                .invalid() ||
            this.profesionalForm
                .provincia()
                .invalid() ||
            this.profesionalForm
                .canton()
                .invalid() ||
            this.profesionalForm
                .distrito()
                .invalid() ||
            this.profesionalForm
                .tarifaBase()
                .invalid() ||
            this.profesionalForm
                .imagenPerfil()
                .invalid() ||
            this.profesionalForm
                .especialidadIds()
                .invalid()
        );
    }

    /*
     * Construye y emite el DTO.
     */
    private emitirGuardar(): void {
        const dto = this.buildDto();

        console.log(
            'JSON del profesional enviado al API:',
            dto,
        );

        this.guardar.emit(dto);
    }

    /*
     * Convierte el formulario al formato del API.
     */
    private buildDto():
        | PerfilProfesionalCreateDto
        | PerfilProfesionalUpdateDto {
        const value = this.profesionalModel();

        return {
            usuarioId: Number(value.usuarioId),

            tituloProfesional:
                value.tituloProfesional.trim(),

            descripcion:
                value.descripcion.trim(),

            annosExperiencia: Number(
                value.annosExperiencia,
            ),

            modalidad: value.modalidad,

            provincia: value.provincia.trim(),

            canton: value.canton.trim(),

            distrito: value.distrito.trim(),

            tarifaBase: Number(
                value.tarifaBase,
            ),

            disponible: Boolean(
                value.disponible,
            ),

            imagenPerfil:
                value.imagenPerfil.trim() ||
                'profile-not-found.jpg',

            especialidadIds:
                value.especialidadIds.map(Number),
        };
    }
}