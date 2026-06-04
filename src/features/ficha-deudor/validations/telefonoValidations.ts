// utils/validations/telefonoValidations.ts
import type { TelefonoFormData } from '../../../shared/types';

export const validateTelefonoForm = (data: TelefonoFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Campos OBLIGATORIOS
  if (!data.numero.trim()) {
    errors.numero = 'El número telefónico es obligatorio';
  } else if (data.numero.length < 6) {
    errors.numero = 'El número debe tener al menos 6 dígitos';
  } else if (!/^[0-9+\-\s]+$/.test(data.numero)) {
    errors.numero = 'Ingrese un número telefónico válido';
  }
  
  if (!data.resultado) {
    errors.resultado = 'El resultado es obligatorio';
  }
  
  if (!data.ubicacion) {
    errors.ubicacion = 'La ubicación es obligatoria';
  }
  
  if (!data.prioridad) {
    errors.prioridad = 'La prioridad es obligatoria';
  }
  
  if (!data.horarioGestion) {
    errors.horarioGestion = 'El horario de gestión es obligatorio';
  }
  
  if (!data.fuenteBusqueda) {
    errors.fuenteBusqueda = 'La fuente de búsqueda es obligatoria';
  }
  
  if (!data.reclamoIndecopi) {
    errors.reclamoIndecopi = 'El reclamo Indecopi es obligatorio';
  }
  
  // Campos opcionales (solo si tienen valor)
  if (data.anexo && data.anexo.length > 10) {
    errors.anexo = 'El anexo no puede tener más de 10 caracteres';
  }
  
  if (data.comentario && data.comentario.length > 500) {
    errors.comentario = 'El comentario no puede exceder 500 caracteres';
  }
  
  if (data.operadorTelefonico && data.operadorTelefonico.length > 50) {
    errors.operadorTelefonico = 'El operador no puede exceder 50 caracteres';
  }
  
  if (data.referencia && data.referencia.length > 100) {
    errors.referencia = 'La referencia no puede exceder 100 caracteres';
  }
  
  return errors;
};