
import type {
  Modulo,
  ModuloEstado,
  ModuloIndicador,
  OpcionApi,
} from '../types/opcion.types';

const toNumberValue = (
  value: unknown
): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

const toTrimmedString = (
  value: unknown
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
};


const toNullableTrimmedString = (
  value: unknown
): string | null => {
  const normalized =
    toTrimmedString(value);

  return normalized || null;
};

const toBooleanValue = (
  value: unknown
): boolean =>
  value === true ||
  value === 1 ||
  value === '1' ||
  value === 'true';

const mapEstado = (
  value: boolean
): ModuloEstado =>
  value
    ? 'Activo'
    : 'Inactivo';

const mapIndicador = (
  value: boolean
): ModuloIndicador =>
  value
    ? 'Sí'
    : 'No';

const resolveNombrePadre = (
  opcion: OpcionApi,
  opcionesById: ReadonlyMap<
    number,
    OpcionApi
  >
): string => {
  const nombrePadreDirecto =
    toTrimmedString(
      opcion.sNombreOpcionPadre
    );

  if (nombrePadreDirecto) {
    return nombrePadreDirecto;
  }

  const idPadre = toNumberValue(
    opcion.nId_OpcionPadre
  );

  if (idPadre <= 0) {
    return '';
  }

  const opcionPadre =
    opcionesById.get(idPadre);

  const nombrePadreResuelto =
    toTrimmedString(
      opcionPadre?.sNombreOpcion
    );

  return nombrePadreResuelto ||
    `Id ${idPadre}`;
};

const mapOpcion = (
  opcion: OpcionApi,
  opcionesById: ReadonlyMap<
    number,
    OpcionApi
  >
): Modulo => {
  const visibleActivo =
    toBooleanValue(
      opcion.bVisible
    );

  const estadoActivo =
    toBooleanValue(
      opcion.bEstado
    );

  return {
    idModulo: toNumberValue(
      opcion.nId_Opcion
    ),

    nombre: toTrimmedString(
      opcion.sNombreOpcion
    ),

    descripcion: toTrimmedString(
      opcion.sDescripcionOpcion
    ),

    codigo: toTrimmedString(
      opcion.sCodigoOpcion
    ),

    ruta: toTrimmedString(
      opcion.sUrlOpcion
    ),

    urlBI: toNullableTrimmedString(
      opcion.sUrlBI
    ),

    imagenOpcion: toNullableTrimmedString(
      opcion.sImagenOpcion
    ),

    emailOpcion: toNullableTrimmedString(
      opcion.sEmailOpcion
    ),

    icono: toTrimmedString(
      opcion.sIcono
    ),

    tipo: toNumberValue(
      opcion.nTipo
    ),

    idPadre: toNumberValue(
      opcion.nId_OpcionPadre
    ),

    codigoPadre: toTrimmedString(
      opcion.sCodigoOpcionPadre
    ),

    padre: resolveNombrePadre(
      opcion,
      opcionesById
    ),

    orden: toNumberValue(
      opcion.nOrden
    ),

    visibleActivo,

    visible: mapIndicador(
      visibleActivo
    ),

    estadoActivo,

    estado: mapEstado(
      estadoActivo
    ),
  };
};

export const mapOpcionesResponse = (
  response:
    | OpcionApi[]
    | OpcionApi
    | null
): Modulo[] => {
  const opciones = Array.isArray(
    response
  )
    ? response
    : response
      ? [response]
      : [];

  const opcionesById = new Map(
    opciones.map(
      (opcion) => [
        toNumberValue(
          opcion.nId_Opcion
        ),
        opcion,
      ]
    )
  );

  return opciones.map(
    (opcion) =>
      mapOpcion(
        opcion,
        opcionesById
      )
  );
};
