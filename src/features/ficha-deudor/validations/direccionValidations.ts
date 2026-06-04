import type { DireccionFormData, DireccionEditFormData } from '../../../shared/types';

// Validación para registrar dirección
export const validateDireccionForm = (data: DireccionFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  } else if (data.direccion.length < 5) {
    errors.direccion = 'Ingrese una dirección más completa (mínimo 5 caracteres)';
  } else if (data.direccion.length > 200) {
    errors.direccion = 'La dirección no puede exceder 200 caracteres';
  }
  
  if (!data.departamento) {
    errors.departamento = 'Seleccione un departamento';
  }
  
  if (!data.provincia) {
    errors.provincia = 'Seleccione una provincia';
  }
  
  if (!data.distrito) {
    errors.distrito = 'Seleccione un distrito';
  }
  
  if (!data.refUbicacion) {
    errors.refUbicacion = 'Seleccione una referencia de ubicación';
  }
  
  if (!data.llegoDeBase || data.llegoDeBase.trim() === '' || data.llegoDeBase === ' ') {
    errors.llegoDeBase = 'Seleccione cómo llegó a la base';
  }
  
  if (!data.tipoDeudor) {
    errors.tipoDeudor = 'Seleccione el tipo de deudor';
  }
  
  if (data.comentario && data.comentario.length > 500) {
    errors.comentario = 'El comentario no puede exceder 500 caracteres';
  }
  
  return errors;
};

// Validación para editar dirección (incluye campos adicionales)
export const validateDireccionEditForm = (data: DireccionEditFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validaciones obligatorias
  if (!data.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  } else if (data.direccion.length < 5) {
    errors.direccion = 'Ingrese una dirección más completa (mínimo 5 caracteres)';
  } else if (data.direccion.length > 200) {
    errors.direccion = 'La dirección no puede exceder 200 caracteres';
  }
  
  if (!data.departamento) {
    errors.departamento = 'Seleccione un departamento';
  }
  
  if (!data.provincia) {
    errors.provincia = 'Seleccione una provincia';
  }
  
  if (!data.distrito) {
    errors.distrito = 'Seleccione un distrito';
  }
  
  if (!data.refUbicacion) {
    errors.refUbicacion = 'Seleccione una referencia de ubicación';
  }
  
  if (!data.llegoDeBase || data.llegoDeBase.trim() === '' || data.llegoDeBase === ' ') {
    errors.llegoDeBase = 'Seleccione cómo llegó a la base';
  }
  
  if (!data.tipoDeudor) {
    errors.tipoDeudor = 'Seleccione el tipo de deudor';
  }
  
  if (!data.estado) {
    errors.estado = 'Seleccione un estado';
  }
  
  // Validación condicional: si tipoDeudor es 'AVAL' o 'GARANTE', nombreAval es obligatorio
  if ((data.tipoDeudor === 'AVAL' || data.tipoDeudor === 'GARANTE') && !data.nombreAval?.trim()) {
    errors.nombreAval = 'El nombre del aval/garante es obligatorio';
  } else if (data.nombreAval && data.nombreAval.length > 100) {
    errors.nombreAval = 'El nombre del aval no puede exceder 100 caracteres';
  }
  
  // Validación de comentario (opcional)
  if (data.comentario && data.comentario.length > 500) {
    errors.comentario = 'El comentario no puede exceder 500 caracteres';
  }
  
  return errors;
};