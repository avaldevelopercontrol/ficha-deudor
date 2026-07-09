import type {
  InfDeudorCabeceraApi,
  InfDeudorParamApi,
  InfDeudorTableRow,
} from '../types/infDeudor.types';
import {
  INF_DEUDOR_POPUP_API_PREFIXES,
  INF_DEUDOR_POPUP_COLUMNS_CONFIG,
  INF_DEUDOR_POPUP_ROW_META,
} from '../constants/infDeudorPopup.constants';
import { getInfDeudorParamKey } from '../utils/infDeudorPopup.utils';

type InfDeudorSource = InfDeudorCabeceraApi | InfDeudorParamApi;

type InfDeudorApiPrefix =
  (typeof INF_DEUDOR_POPUP_API_PREFIXES)[keyof typeof INF_DEUDOR_POPUP_API_PREFIXES];

const buildInfDeudorRow = (
  id: string,
  tipo: string,
  source: InfDeudorSource,
  prefix: InfDeudorApiPrefix
): InfDeudorTableRow => {
  const row: InfDeudorTableRow = {
    id,
    tipo,
  };

  for (
    let index = INF_DEUDOR_POPUP_COLUMNS_CONFIG.start;
    index <= INF_DEUDOR_POPUP_COLUMNS_CONFIG.end;
    index += 1
  ) {
    const paramIndex = index.toString().padStart(2, '0');
    const apiKey = `${prefix}${paramIndex}`;
    const paramKey = getInfDeudorParamKey(index);
    const value = (source as Record<string, unknown>)[apiKey];

    row[paramKey] = typeof value === 'string' ? value : '';
  }

  return row;
};

export const mapInfDeudorApiToTableRows = (
  cabeceraPrincipal: InfDeudorCabeceraApi,
  cabeceraAdicional: InfDeudorCabeceraApi,
  valoresDeudor: InfDeudorParamApi
): InfDeudorTableRow[] => [
  buildInfDeudorRow(
    INF_DEUDOR_POPUP_ROW_META.cabeceraPrincipal.id,
    INF_DEUDOR_POPUP_ROW_META.cabeceraPrincipal.tipo,
    cabeceraPrincipal,
    INF_DEUDOR_POPUP_API_PREFIXES.cabecera
  ),
  buildInfDeudorRow(
    INF_DEUDOR_POPUP_ROW_META.cabeceraAdicional.id,
    INF_DEUDOR_POPUP_ROW_META.cabeceraAdicional.tipo,
    cabeceraAdicional,
    INF_DEUDOR_POPUP_API_PREFIXES.cabecera
  ),
  buildInfDeudorRow(
    INF_DEUDOR_POPUP_ROW_META.valoresDeudor.id,
    INF_DEUDOR_POPUP_ROW_META.valoresDeudor.tipo,
    valoresDeudor,
    INF_DEUDOR_POPUP_API_PREFIXES.valores
  ),
];