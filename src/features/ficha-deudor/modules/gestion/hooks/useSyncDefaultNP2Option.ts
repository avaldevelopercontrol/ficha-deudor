import { useEffect } from 'react';

import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';
import type { SetGestionField } from '../types/fichaGestion.types';

interface UseSyncDefaultNP2OptionParams {
  np1: string;
  np2: string;
  np2Options: PaletaRespuestaOption[];
  isLoadingNP2: boolean;
  setField: SetGestionField;
}

export const useSyncDefaultNP2Option = ({
  np1,
  np2,
  np2Options,
  isLoadingNP2,
  setField,
}: UseSyncDefaultNP2OptionParams) => {
  useEffect(() => {
    if (!np1 || isLoadingNP2 || np2Options.length === 0) {
      return;
    }

    const currentOptionExists = np2Options.some(
      (option) => String(option.id) === np2
    );

    if (currentOptionExists) {
      return;
    }

    setField('np2', String(np2Options[0].id));
  }, [
    isLoadingNP2,
    np1,
    np2,
    np2Options,
    setField,
  ]);
};