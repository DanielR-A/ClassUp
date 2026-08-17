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

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  Modalidad,
  Servicio,
  ServicioCreateDto,
  ServicioFormModel,
  ServicioUpdateDto,
} from '../../../core/models/servicio.model';

import { Categoria } from '../../../core/models/categoria.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [
    CommonModule,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './servicio-form.html',
  styleUrl: './servicio-form.css',
})
export class ServicioForm {
  /*
   * Registro que se editará.
   * Cuando es null, el formulario funciona en modo creación.
   */
  servicio = input<Servicio | null>(null);

  /*
   * Datos que utilizarán los selects y checkboxes.
   */
  categorias = input<Categoria[]>([]);
  profesionales = input<PerfilProfesional[]>([]);
  especialidades = input<Especialidad[]>([]);

  /*
   * Indica si el componente padre está guardando el registro.
   */
  saving = input<boolean>(false);

  /*
   * Eventos enviados al componente padre.
   */
  guardar = output<ServicioCreateDto | ServicioUpdateDto>();
  cancelar = output<void>();

  /*
   * Opciones disponibles para la modalidad.
   */
  modalidades: Modalidad[] = [
    'VIRTUAL',
    'PRESENCIAL',
    'MIXTA',
  ];

  /*
   * Estado principal del formulario.
   */
  servicioModel = signal<ServicioFormModel>({
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionMinutos: 0,
    modalidad: 'VIRTUAL',
    profesionalId: null,
    categoriaId: null,
    especialidadIds: [],
  });

  /*
   * Formulario basado en Signals.
   */
  servicioForm = form(this.servicioModel, (path) => {
    /*
     * Nombre
     */
    required(path.nombre, {
      message: 'El nombre es obligatorio',
    });

    minLength(path.nombre, 3, {
      message: 'El nombre debe contener al menos 3 caracteres',
    });

    maxLength(path.nombre, 150, {
      message: 'El nombre no puede superar los 150 caracteres',
    });

    pattern(
      path.nombre,
      /^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s:'\-&.,()]+$/,
      {
        message:
          'El nombre solo puede contener letras, números, espacios y signos básicos',
      },
    );

    validate(path.nombre, (ctx) => {
      const nombre = ctx.value().trim();

      if (
        nombre.length > 0 &&
        nombre === nombre.toUpperCase()
      ) {
        return {
          kind: 'nombreMayusculas',
          message:
            'No escriba todo el nombre en mayúsculas',
        };
      }

      return undefined;
    });

    /*
     * Descripción
     */
    required(path.descripcion, {
      message: 'La descripción es obligatoria',
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
      const descripcion = ctx.value().trim();

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
     * Precio
     */
    required(path.precio, {
      message: 'El precio es obligatorio',
    });

    min(path.precio, 1, {
      message: 'El precio debe ser mayor a 0',
    });

    validate(path.precio, (ctx) => {
      const precio = Number(ctx.value());

      if (!Number.isFinite(precio)) {
        return {
          kind: 'precioInvalido',
          message: 'Ingrese un precio válido',
        };
      }

      if (precio > 1000000) {
        return {
          kind: 'precioExcesivo',
          message:
            'El precio no puede superar ₡1 000 000',
        };
      }

      return undefined;
    });

    /*
     * Duración
     */
    required(path.duracionMinutos, {
      message: 'La duración es obligatoria',
    });

    min(path.duracionMinutos, 1, {
      message:
        'La duración debe ser mayor a 0 minutos',
    });

    validate(path.duracionMinutos, (ctx) => {
      const duracion = Number(ctx.value());

      if (!Number.isInteger(duracion)) {
        return {
          kind: 'duracionEntera',
          message:
            'La duración debe ser un número entero',
        };
      }

      if (duracion > 480) {
        return {
          kind: 'duracionExcesiva',
          message:
            'La duración no puede superar 480 minutos',
        };
      }

      return undefined;
    });

    /*
     * Modalidad
     */
    required(path.modalidad, {
      message: 'Seleccione una modalidad',
    });

    validate(path.modalidad, (ctx) => {
      const modalidad = ctx.value();

      const modalidadesValidas: Modalidad[] = [
        'VIRTUAL',
        'PRESENCIAL',
        'MIXTA',
      ];

      if (!modalidadesValidas.includes(modalidad)) {
        return {
          kind: 'modalidadInvalida',
          message: 'La modalidad seleccionada no es válida',
        };
      }

      return undefined;
    });

    /*
     * Profesional
     */
    required(path.profesionalId, {
      message: 'Seleccione un profesional',
    });

    validate(path.profesionalId, (ctx) => {
      const profesionalId = Number(ctx.value());

      if (
        ctx.value() !== null &&
        (!Number.isInteger(profesionalId) ||
          profesionalId <= 0)
      ) {
        return {
          kind: 'profesionalInvalido',
          message:
            'El profesional seleccionado no es válido',
        };
      }

      return undefined;
    });

    /*
     * Categoría
     */
    required(path.categoriaId, {
      message: 'Seleccione una categoría',
    });

    validate(path.categoriaId, (ctx) => {
      const categoriaId = Number(ctx.value());

      if (
        ctx.value() !== null &&
        (!Number.isInteger(categoriaId) ||
          categoriaId <= 0)
      ) {
        return {
          kind: 'categoriaInvalida',
          message:
            'La categoría seleccionada no es válida',
        };
      }

      return undefined;
    });

    /*
     * Especialidades
     */
    validate(path.especialidadIds, (ctx) => {
      const especialidadIds = ctx.value();

      if (
        !especialidadIds ||
        especialidadIds.length === 0
      ) {
        return {
          kind: 'especialidadRequerida',
          message:
            'Seleccione al menos una especialidad',
        };
      }

      return undefined;
    });

    validate(path.especialidadIds, (ctx) => {
      const especialidadIds = ctx.value();

      const contieneIdInvalido =
        especialidadIds.some(
          (id) =>
            !Number.isInteger(Number(id)) ||
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
    });
  });

  /*
   * true cuando se está editando un servicio.
   */
  isEdit = computed(
    () => this.servicio() !== null,
  );

  /*
   * Desactiva el botón mientras el componente padre guarda.
   */
  isSubmitting = computed(() => this.saving());

  constructor() {
    /*
     * Cuando cambia el servicio recibido, se cargan sus datos.
     */
    effect(() => {
      const servicioActual = this.servicio();

      if (!servicioActual) {
        this.resetForm();
        return;
      }

      this.servicioModel.set({
        nombre: servicioActual.nombre ?? '',
        descripcion:
          servicioActual.descripcion ?? '',
        precio: Number(
          servicioActual.precio ?? 0,
        ),
        duracionMinutos:
          servicioActual.duracionMinutos ?? 0,
        modalidad:
          servicioActual.modalidad ?? 'VIRTUAL',
        profesionalId:
          servicioActual.profesionalId ?? null,
        categoriaId:
          servicioActual.categoriaId ?? null,
        especialidadIds:
          servicioActual.especialidades?.map(
            (especialidad) => especialidad.id,
          ) ?? [],
      });
    });
  }

  /*
   * Limpia el formulario cuando se crea un registro nuevo.
   */
  private resetForm(): void {
    this.servicioModel.set({
      nombre: '',
      descripcion: '',
      precio: 0,
      duracionMinutos: 0,
      modalidad: 'VIRTUAL',
      profesionalId: null,
      categoriaId: null,
      especialidadIds: [],
    });
  }

  /*
   * Agrega o elimina una especialidad del servicio.
   */
  toggleEspecialidad(
    id: number,
    checked: boolean,
  ): void {
    this.servicioModel.update((value) => ({
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
    }));

    this.servicioForm
      .especialidadIds()
      .markAsTouched();
  }

  /*
   * Permite saber si un checkbox debe aparecer seleccionado.
   */
  isEspecialidadSelected(
    id: number,
  ): boolean {
    return this.servicioModel()
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
   * Marca todos los campos para mostrar los errores.
   */
  private marcarCamposComoTocados(): void {
    this.servicioForm.nombre().markAsTouched();

    this.servicioForm
      .descripcion()
      .markAsTouched();

    this.servicioForm.precio().markAsTouched();

    this.servicioForm
      .duracionMinutos()
      .markAsTouched();

    this.servicioForm
      .modalidad()
      .markAsTouched();

    this.servicioForm
      .profesionalId()
      .markAsTouched();

    this.servicioForm
      .categoriaId()
      .markAsTouched();

    this.servicioForm
      .especialidadIds()
      .markAsTouched();
  }

  /*
   * Comprueba si cualquiera de los campos es inválido.
   */
  private formularioInvalido(): boolean {
    return (
      this.servicioForm.nombre().invalid() ||
      this.servicioForm
        .descripcion()
        .invalid() ||
      this.servicioForm.precio().invalid() ||
      this.servicioForm
        .duracionMinutos()
        .invalid() ||
      this.servicioForm
        .modalidad()
        .invalid() ||
      this.servicioForm
        .profesionalId()
        .invalid() ||
      this.servicioForm
        .categoriaId()
        .invalid() ||
      this.servicioForm
        .especialidadIds()
        .invalid()
    );
  }

  /*
   * Construye y envía el DTO al componente padre.
   */
  private emitirGuardar(): void {
    const dto = this.buildDto();

    console.log(
      'JSON del servicio enviado al API:',
      dto,
    );

    this.guardar.emit(dto);
  }

  /*
   * Convierte el estado del formulario al formato esperado por el API.
   */
  private buildDto():
    | ServicioCreateDto
    | ServicioUpdateDto {
    const value = this.servicioModel();

    return {
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim(),
      precio: Number(value.precio),
      duracionMinutos: Number(
        value.duracionMinutos,
      ),
      modalidad: value.modalidad,
      profesionalId: Number(
        value.profesionalId,
      ),
      categoriaId: Number(
        value.categoriaId,
      ),
      especialidadIds:
        value.especialidadIds.map(Number),
    };
  }
}