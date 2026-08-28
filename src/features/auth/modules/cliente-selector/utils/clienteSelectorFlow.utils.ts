import type { CarteraParametro } from '../../../types';

interface CanContinueClienteSelectorParams {
  hasSelectedCliente: boolean;
  anios: number[];
  selectedAnio: number | '';
  carteras: CarteraParametro[];
  hasSelectedCartera: boolean;
  isLoading: boolean;
  isAniosLoading: boolean;
  isCarterasLoading: boolean;
  hasLoadedAnios: boolean;
  hasLoadedCarteras: boolean;
  aniosError: string | null;
  carterasError: string | null;
}

export const canContinueClienteSelector = ({
  hasSelectedCliente,
  anios,
  selectedAnio,
  carteras,
  hasSelectedCartera,
  isLoading,
  isAniosLoading,
  isCarterasLoading,
  hasLoadedAnios,
  hasLoadedCarteras,
  aniosError,
  carterasError,
}: CanContinueClienteSelectorParams): boolean => {
  if (
    !hasSelectedCliente ||
    isLoading ||
    isAniosLoading ||
    isCarterasLoading ||
    aniosError ||
    carterasError ||
    !hasLoadedAnios
  ) {
    return false;
  }

  if (anios.length === 0) {
    return true;
  }

  if (selectedAnio === '' || !hasLoadedCarteras) {
    return false;
  }

  if (carteras.length === 0) {
    return false;
  }

  return carteras.length === 1 || hasSelectedCartera;
};
