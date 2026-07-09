import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  FichaDeudorParams,
  FichaDeudorRequiredParamKey,
} from '../../shared/types/fichaDeudor.types';

const REQUIRED_PARAMS = [
  'id_cliente',
  'id_cartera',
  'id_deudor',
  'id_contrato',
  'id_usuario',
] as const;

type RequiredParamName = FichaDeudorRequiredParamKey;

export function useFichaDeudorParams() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const params: FichaDeudorParams = {
      id_cliente: searchParams.get('id_cliente') ?? '',
      id_cartera: searchParams.get('id_cartera') ?? '',
      id_deudor: searchParams.get('id_deudor') ?? '',
      id_contrato: searchParams.get('id_contrato') ?? '',
      id_usuario: searchParams.get('id_usuario') ?? '',
      fecha_inicio_gestion:
        searchParams.get('fecha_inicio_gestion') ?? new Date().toISOString(),
    };

    const missingParams = REQUIRED_PARAMS.filter(
      (paramName: RequiredParamName) => !params[paramName]
    );

    return {
      params,
      hasRequiredParams: missingParams.length === 0,
      missingParams,
      exampleUrl:
        '/ficha-deudor?id_cliente=95&id_cartera=34048&id_deudor=4650189&id_contrato=182&id_usuario=16068&fecha_inicio_gestion=2026-07-03T13%3A55%3A52.960Z',
    };
  }, [searchParams]);
}

export function useUrlParams(): FichaDeudorParams {
  const { params } = useFichaDeudorParams();
  return params;
}