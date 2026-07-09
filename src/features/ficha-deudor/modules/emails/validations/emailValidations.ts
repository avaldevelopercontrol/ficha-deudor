import type { EmailFormData, EmailEditFormData } from '../types/email.types';

export function validateEmailForm(data: EmailFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.email || data.email.trim() === '') {
    errors.email = 'El email es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'El formato del email no es válido';
  }

  if (!data.contacto || data.contacto.trim() === '') {
    errors.contacto = 'El contacto es obligatorio';
  }

  if (!data.prioridad || data.prioridad === '') {
    errors.prioridad = 'La prioridad es obligatoria';
  }

  if (data.status === undefined || data.status === null || data.status === '') {
    errors.status = 'El status es obligatorio';
  }

  if (data.estado === true && data.status !== '1') {
    errors.status = 'Para estado Activo, el status debe ser Operativo';
  }

  return errors;
}

export function validateEmailEditForm(data: EmailEditFormData): Record<string, string> {
  // Reutiliza las mismas reglas + validación de ID
  const errors = validateEmailForm(data);

  if (!data.id || data.id.trim() === '') {
    errors.id = 'El ID del email es obligatorio';
  }

  return errors;
}