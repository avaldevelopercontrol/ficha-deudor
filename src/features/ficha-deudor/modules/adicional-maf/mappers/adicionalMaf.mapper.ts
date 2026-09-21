import type {
  AdicionalMaf,
  AdicionalMafApi,
  AdicionalMafGestion,
  AdicionalMafGestionApi,
  AdicionalMafOperacion,
  AdicionalMafOperacionApi,
} from '../types/adicionalMaf.types';

const normalizeRequiredText = (value: string): string => {
  return value.trim();
};

const normalizeNullableText = (
  value: string | null
): string | null => {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue || null;
};

const mapGestion = (
  gestion: AdicionalMafGestionApi
): AdicionalMafGestion => {
  return {
    ventanaMeses: gestion.ventanaMeses,
    canal: gestion.canal,
    canalNombre: normalizeRequiredText(gestion.canalNombre),
    idDocxCobrarOpe: gestion.nId_DocxCobrarOpe,
    idDocxCobrar: gestion.nId_DocxCobrar,
    fecha: normalizeNullableText(gestion.fecha),
    estatus: normalizeRequiredText(gestion.estatus),
    peso: gestion.peso,
    telefono: normalizeNullableText(gestion.telefono),
    comentario: normalizeNullableText(gestion.comentario),
    intentos: gestion.intentos,
    intentosRobot: gestion.intentosRobot,
    contactosDirectos: gestion.contactosDirectos,
    origenDireccion: normalizeNullableText(
      gestion.origenDireccion
    ),
    direccion: normalizeNullableText(gestion.direccion),
  };
};

const mapOperacion = (
  operacion: AdicionalMafOperacionApi
): AdicionalMafOperacion => {
  return {
    operacion: normalizeRequiredText(operacion.operacion),
    placa: normalizeNullableText(operacion.placa),
    diasAtraso: operacion.diasAtraso,
    idUbigeo: operacion.nId_Ubigeo,
    estadoOperacion: normalizeNullableText(
      operacion.estadoOperacion
    ),
    avanceCredito: normalizeNullableText(
      operacion.avanceCredito
    ),
    direccionLegal: normalizeNullableText(
      operacion.direccionLegal
    ),
    distritoLegal: normalizeNullableText(
      operacion.distritoLegal
    ),
    provinciaLegal: normalizeNullableText(
      operacion.provinciaLegal
    ),
    departamentoLegal: normalizeNullableText(
      operacion.departamentoLegal
    ),
  };
};

export const mapAdicionalMaf = (
  api: AdicionalMafApi
): AdicionalMaf => {
  return {
    numeroDiasNoContacto: api.numeroDiasNoContacto,
    fechaUltimoContacto: normalizeNullableText(
      api.fechaUltimoContacto
    ),
    cantidadTotalVino: api.cantidadTotalVino,
    cantidadTotalPago: api.cantidadTotalPago,
    cantidadTotalVino6Meses: api.cantidadTotalVino6Meses,
    cantidadTotalPago6Meses: api.cantidadTotalPago6Meses,
    cobertura: normalizeNullableText(api.cobertura),
    mejoresGestiones: api.mejoresGestiones.map(mapGestion),
    operaciones: api.operaciones.map(mapOperacion),
  };
};
