import type { SelectOption } from '@shared/types';

export interface PaletaRespuestaOption extends SelectOption {
  idTipoContacto: number | null;
}

interface CatalogItem {
  id: string | number;
  nombre: string;
}

interface PaletaRespuestaItem extends CatalogItem {
  idTipoContacto?: number | null;
}

export const mapCatalogToOptions = <T extends CatalogItem>(
  data: T[] | null | undefined
): SelectOption[] => {
  return (
    data?.map((item) => ({
      id: String(item.id),
      label: item.nombre,
    })) ?? []
  );
};

export const mapPaletaRespuestaToOptions = <T extends PaletaRespuestaItem>(
  data: T[] | null | undefined
): PaletaRespuestaOption[] => {
  return (
    data?.map((item) => ({
      id: String(item.id),
      label: item.nombre,
      idTipoContacto: item.idTipoContacto ?? null,
    })) ?? []
  );
};