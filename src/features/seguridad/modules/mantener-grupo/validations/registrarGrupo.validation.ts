import type {
  RegistrarGrupoFormData,
} from '../types/registrarGrupo.types';

export const normalizeRegistrarGrupoForm = (
  form: RegistrarGrupoFormData
): RegistrarGrupoFormData => ({
  nombre:
    form.nombre.trim(),

  sigla:
    form.sigla.trim(),

  clienteId:
    form.clienteId,

  estado:
    form.estado,
});

export const validateRegistrarGrupoForm = (
  form: RegistrarGrupoFormData
): Record<string, string> => {
  const errors:
    Record<string, string> = {};

  const normalizedForm =
    normalizeRegistrarGrupoForm(
      form
    );

  if (!normalizedForm.nombre) {
    errors.nombre =
      'El nombre del grupo es obligatorio.';
  }

  if (!normalizedForm.sigla) {
    errors.sigla =
      'La sigla es obligatoria.';
  }

  if (
    normalizedForm.clienteId === '' ||
    !Number.isInteger(
      Number(
        normalizedForm.clienteId
      )
    ) ||
    Number(
      normalizedForm.clienteId
    ) <= 0
  ) {
    errors.clienteId =
      'Seleccione un cliente válido.';
  }

  if (
    typeof normalizedForm.estado !==
    'boolean'
  ) {
    errors.estado =
      'El estado seleccionado no es válido.';
  }

  return errors;
};
