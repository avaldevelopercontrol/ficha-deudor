import { useMemo } from 'react';

import { CLIENTE_CLARO_ID } from '../constants/fichaGestion.constants';
import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';

interface UseFichaGestionDerivedValuesParams {
  idCliente: string;
  idUsuario: string;
  usuarioNombre?: string | null;
  usuarioApellido?: string | null;
  np1: string;
  np1Options: PaletaRespuestaOption[];
}

export const useFichaGestionDerivedValues = ({
  idCliente,
  idUsuario,
  usuarioNombre,
  usuarioApellido,
  np1,
  np1Options,
}: UseFichaGestionDerivedValuesParams) => {
  const usuarioActual = useMemo(() => {
    const nombreCompleto = [usuarioNombre, usuarioApellido]
      .filter(Boolean)
      .join(' ')
      .trim();

    return nombreCompleto || idUsuario || 'Usuario';
  }, [usuarioNombre, usuarioApellido, idUsuario]);

  const mostrarCamposClaro = useMemo(() => {
    return String(idCliente).trim() === CLIENTE_CLARO_ID;
  }, [idCliente]);

  const np1TipoContacto = useMemo(() => {
    const np1Seleccionado = np1Options.find(
      (option) => String(option.id) === String(np1)
    );

    return Number(np1Seleccionado?.idTipoContacto ?? 0);
  }, [np1Options, np1]);

  return {
    usuarioActual,
    mostrarCamposClaro,
    np1TipoContacto,
  };
};