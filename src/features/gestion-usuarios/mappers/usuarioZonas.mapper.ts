import type {
  UsuarioZonaAsignadaApi,
  UsuarioZonaFaltanteApi,
} from '../types/usuarioZonas.types';

import type {
  UsuarioZonaDiff,
  UsuarioZonaItem,
} from '../modules/asignar-usuario/types/usuarioZonas.types';

const normalizeText = (
  value: unknown
): string =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ');

const normalizeZona = (
  value: unknown
): string => normalizeText(value);

const buildZonaNombre = (
  zona: string,
  description: unknown
): string => {
  const normalizedZona =
    normalizeZona(zona);

  const normalizedDescription =
    normalizeText(description);

  if (!normalizedDescription) {
    return normalizedZona;
  }

  if (
    normalizedDescription === normalizedZona ||
    normalizedDescription.startsWith(
      `${normalizedZona} `
    )
  ) {
    return normalizedDescription;
  }

  return `${normalizedZona} ${normalizedDescription}`.trim();
};

const toPositiveIntegerOrNull = (
  value: unknown
): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : null;
};

export const mapUsuarioZonaFaltante = (
  item: UsuarioZonaFaltanteApi,
  idUsuario: number,
  idCliente: number
): UsuarioZonaItem => ({
  idAsignacion:
    toPositiveIntegerOrNull(
      item.nid_asignacion
    ),
  idUsuario,
  idCliente,
  zona: normalizeZona(item.zona),
  nombre: buildZonaNombre(
    item.zona,
    item.descripcionZona
  ),
  estado: item.bEstado,
});

export const mapUsuarioZonaAsignada = (
  item: UsuarioZonaAsignadaApi
): UsuarioZonaItem => ({
  idAsignacion:
    toPositiveIntegerOrNull(
      item.nid_asignacion
    ),
  idUsuario: Number(item.nid_usuario),
  idCliente: Number(item.nid_cliente),
  zona: normalizeZona(item.zona),
  nombre: buildZonaNombre(
    item.zona,
    item.region
  ),
  estado: Boolean(item.bestado),
});

const getZonaKey = (
  zona: UsuarioZonaItem
): string => zona.zona;

export const sortUsuarioZonas = (
  zonas: readonly UsuarioZonaItem[]
): UsuarioZonaItem[] =>
  [...zonas].sort((first, second) =>
    first.nombre.localeCompare(
      second.nombre,
      'es',
      {
        numeric: true,
        sensitivity: 'base',
      }
    )
  );

export const dedupeUsuarioZonas = (
  zonas: readonly UsuarioZonaItem[]
): UsuarioZonaItem[] => {
  const byZona = new Map<
    string,
    UsuarioZonaItem
  >();

  zonas.forEach((zona) => {
    const key = getZonaKey(zona);
    const current = byZona.get(key);

    if (
      !current ||
      (current.idAsignacion === null &&
        zona.idAsignacion !== null) ||
      (current.estado !== true &&
        zona.estado === true)
    ) {
      byZona.set(key, zona);
    }
  });

  return sortUsuarioZonas(
    Array.from(byZona.values())
  );
};

export const getUsuarioZonaDiff = (
  iniciales: readonly UsuarioZonaItem[],
  actuales: readonly UsuarioZonaItem[]
): UsuarioZonaDiff => {
  const initialKeys = new Set(
    iniciales.map(getZonaKey)
  );

  const currentKeys = new Set(
    actuales.map(getZonaKey)
  );

  return {
    agregar: actuales.filter(
      (item) =>
        !initialKeys.has(
          getZonaKey(item)
        )
    ),
    quitar: iniciales.filter(
      (item) =>
        !currentKeys.has(
          getZonaKey(item)
        )
    ),
  };
};
