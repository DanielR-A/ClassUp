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
  minLength,
  maxLength,
  pattern,
  validate,
  
} from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { NgxMaskDirective } from 'ngx-mask';

import {
  Role,
  Usuario,
  UsuarioCreateDto,
  UsuarioFormModel,
  UsuarioUpdateDto,
} from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    FormField,

    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    NgxMaskDirective,
  ],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  /*
   * Usuario que se editará.
   * Cuando es null, el formulario funciona en modo creación.
   */
  usuario = input<Usuario | null>(null);

  /*
   * Indica si el componente padre está guardando.
   */
  saving = input<boolean>(false);


/*
 * Indica si el formulario se usa para registro público.
 * En este modo no se permite seleccionar el rol.
 */
modoRegistroPublico = input<boolean>(false);
  /*
   * Eventos enviados al componente padre.
   */
  guardar = output<
    UsuarioCreateDto | UsuarioUpdateDto
  >();

  cancelar = output<void>();

  /*
   * Roles disponibles.
   */
  readonly roles: {
    value: Role;
    label: string;
    icon: string;
  }[] = [
      {
        value: Role.ADMIN,
        label: 'Administrador',
        icon: 'admin_panel_settings',
      },
      {
        value: Role.PROFESIONAL,
        label: 'Profesional',
        icon: 'school',
      },
      {
        value: Role.USER,
        label: 'Cliente',
        icon: 'person',
      },
    ];

  /*
   * Estado principal del formulario.
   */
  usuarioModel = signal<UsuarioFormModel>({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    cedula: '',
    role: Role.USER,
  });

  /*
   * Formulario basado en Signals.
   */
  usuarioForm = form(
    this.usuarioModel,
    (path) => {
      /*
       * Nombre
       */
      required(path.nombre, {
        message: 'El nombre es obligatorio',
      });

      minLength(path.nombre, 2, {
        message:
          'El nombre debe contener al menos 2 caracteres',
      });

      maxLength(path.nombre, 100, {
        message:
          'El nombre no puede superar los 100 caracteres',
      });

      pattern(
        path.nombre,
        /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s'-]+$/,
        {
          message:
            'El nombre solo puede contener letras y espacios',
        },
      );

      /*
       * Apellidos
       */
      required(path.apellidos, {
        message: 'Los apellidos son obligatorios',
      });

      minLength(path.apellidos, 2, {
        message:
          'Los apellidos deben contener al menos 2 caracteres',
      });

      maxLength(path.apellidos, 150, {
        message:
          'Los apellidos no pueden superar los 150 caracteres',
      });

      pattern(
        path.apellidos,
        /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s'-]+$/,
        {
          message:
            'Los apellidos solo pueden contener letras y espacios',
        },
      );

      /*
       * Correo
       */
      required(path.email, {
        message: 'El correo es obligatorio',
      });

      maxLength(path.email, 150, {
        message:
          'El correo no puede superar los 150 caracteres',
      });

      pattern(
        path.email,
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        {
          message:
            'Ingrese un correo electrónico válido',
        },
      );

      /*
       * Contraseña
       *
       * En creación es obligatoria.
       * En edición puede dejarse vacía para conservarla.
       */
      validate(path.password, (ctx) => {
        const password = ctx.value();
        const editando =
          this.usuario() !== null;

        if (!editando && password.length === 0) {
          return {
            kind: 'passwordRequerida',
            message:
              'La contraseña es obligatoria',
          };
        }

        if (
          password.length > 0 &&
          password.length < 8
        ) {
          return {
            kind: 'passwordCorta',
            message:
              'La contraseña debe tener al menos 8 caracteres',
          };
        }

        if (password.length > 255) {
          return {
            kind: 'passwordLarga',
            message:
              'La contraseña no puede superar los 255 caracteres',
          };
        }

        return undefined;
      });

      /*
       * Teléfono
       *
       * La máscara muestra: 8888-8888
       * El formulario conserva: 88888888
       */
      validate(path.telefono, (ctx) => {
        const telefono =
          ctx.value().trim();

        if (telefono.length === 0) {
          return undefined;
        }

        if (!/^\d{8}$/.test(telefono)) {
          return {
            kind: 'telefonoInvalido',
            message:
              'El teléfono debe contener exactamente 8 dígitos',
          };
        }

        return undefined;
      });

      /*
       * Cédula
       *
       * La máscara muestra: 1-1234-5678
       * El formulario conserva: 112345678
       */
      validate(path.cedula, (ctx) => {
        const cedula =
          ctx.value().trim();

        if (cedula.length === 0) {
          return undefined;
        }

        if (!/^\d{9}$/.test(cedula)) {
          return {
            kind: 'cedulaInvalida',
            message:
              'La cédula debe contener exactamente 9 dígitos',
          };
        }

        return undefined;
      });

      /*
       * Rol
       */
      required(path.role, {
        message: 'Seleccione un rol',
      });

      validate(path.role, (ctx) => {
        const role = ctx.value();

        const rolesValidos: Role[] = [
          Role.ADMIN,
          Role.PROFESIONAL,
          Role.USER,
        ];

        if (!rolesValidos.includes(role)) {
          return {
            kind: 'roleInvalido',
            message:
              'El rol seleccionado no es válido',
          };
        }

        return undefined;
      });
    },
  );

  /*
   * true cuando se está editando un usuario.
   */
  isEdit = computed(
    () => this.usuario() !== null,
  );

  /*
   * Desactiva el formulario mientras se guarda.
   */
  isSubmitting = computed(
    () => this.saving(),
  );

  constructor() {
    /*
     * Cuando cambia el usuario recibido,
     * se cargan sus datos en el formulario.
     */
    effect(() => {
      const usuarioActual =
        this.usuario();

      if (!usuarioActual) {
        this.resetForm();
        return;
      }

      this.usuarioModel.set({
        nombre:
          usuarioActual.nombre ?? '',

        apellidos:
          usuarioActual.apellidos ?? '',

        email:
          usuarioActual.email ?? '',

        /*
         * La contraseña nunca se carga
         * desde el API.
         */
        password: '',

        telefono:
          usuarioActual.telefono ?? '',

        cedula:
          usuarioActual.cedula ?? '',

        role:
          usuarioActual.role ?? 'USER',
      });
    });
  }

  /*
   * Limpia el formulario para crear un usuario.
   */
  private resetForm(): void {
    this.usuarioModel.set({
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      telefono: '',
      cedula: '',
      role: Role.USER,
    });
  }

  /*
   * Ejecutado al enviar el formulario.
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
   * Marca los campos para mostrar los errores.
   */
  private marcarCamposComoTocados(): void {
    this.usuarioForm
      .nombre()
      .markAsTouched();

    this.usuarioForm
      .apellidos()
      .markAsTouched();

    this.usuarioForm
      .email()
      .markAsTouched();

    this.usuarioForm
      .password()
      .markAsTouched();

    this.usuarioForm
      .telefono()
      .markAsTouched();

    this.usuarioForm
      .cedula()
      .markAsTouched();

    this.usuarioForm
      .role()
      .markAsTouched();
  }

  /*
   * Comprueba si existe algún campo inválido.
   */
  private formularioInvalido(): boolean {
    return (
      this.usuarioForm.nombre().invalid() ||
      this.usuarioForm
        .apellidos()
        .invalid() ||
      this.usuarioForm.email().invalid() ||
      this.usuarioForm
        .password()
        .invalid() ||
      this.usuarioForm
        .telefono()
        .invalid() ||
      this.usuarioForm
        .cedula()
        .invalid() ||
      this.usuarioForm.role().invalid()
    );
  }

  /*
   * Construye y envía el DTO.
   */
  private emitirGuardar(): void {
    const dto = this.buildDto();

    console.log(
      'JSON del usuario enviado al API:',
      dto,
    );

    this.guardar.emit(dto);
  }

  /*
   * Convierte el estado del formulario
   * al formato esperado por el API.
   */
  private buildDto():
    | UsuarioCreateDto
    | UsuarioUpdateDto {
    const value = this.usuarioModel();

    const datosComunes = {
      nombre: value.nombre.trim(),

      apellidos:
        value.apellidos.trim(),

      email: value.email
        .trim()
        .toLowerCase(),

      telefono:
        value.telefono.trim() ||
        undefined,

      cedula:
        value.cedula.trim() ||
        undefined,

      role: value.role,
    };

    /*
     * En edición la contraseña solo se envía
     * cuando el usuario escribió una nueva.
     */
    if (this.isEdit()) {
      const dto: UsuarioUpdateDto = {
        ...datosComunes,
      };

      if (value.password.trim()) {
        dto.password =
          value.password;
      }

      return dto;
    }

    /*
     * En creación la contraseña es obligatoria.
     */
    const dto: UsuarioCreateDto = {
      ...datosComunes,
      password: value.password,
    };

    return dto;
  }

  /*
   * Emite el evento de cancelación.
   */
  cancelarFormulario(): void {
    this.cancelar.emit();
  }
}