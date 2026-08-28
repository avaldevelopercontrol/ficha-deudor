import { useMemo } from 'react';

import Table from '@shared/components/table/Table';
import type { Column } from '@shared/types';

import type { CarteraParametro } from '../../../types';
import { buildCarteraParametroSelectionKey } from '../utils/carteraParametroSelection.utils';

interface CarteraParametrosTableProps {
  carteras: CarteraParametro[];
  selectedCarteraKey: string;
  onSelect: (carteraKey: string) => void;
}

export const CarteraParametrosTable = ({
  carteras,
  selectedCarteraKey,
  onSelect,
}: CarteraParametrosTableProps) => {
  const columns = useMemo<Column<CarteraParametro>[]>(
    () => [
      {
        key: 'seleccion',
        label: 'Seleccione',
        width: '92px',
        align: 'center',
        render: (cartera) => {
          const carteraKey = buildCarteraParametroSelectionKey(cartera);

          return (
            <input
              type="radio"
              name="cartera-parametro"
              checked={selectedCarteraKey === carteraKey}
              onChange={() => onSelect(carteraKey)}
              onClick={(event) => event.stopPropagation()}
              aria-label={`Seleccionar campaña ${cartera.campania} del año ${cartera.anio}`}
            />
          );
        },
      },
      {
        key: 'campania',
        label: 'Campaña',
        align: 'center',
      },
      {
        key: 'anio',
        label: 'Año',
        align: 'center',
      },
      {
        key: 'estado',
        label: 'Estado',
        align: 'center',
      },
    ],
    [onSelect, selectedCarteraKey]
  );

  return (
    <div className="cliente-selector__carteras-table">
      <div className="cliente-selector__carteras-title">Carteras</div>
      <Table
        columns={columns}
        data={carteras}
        onRowClick={(cartera) =>
          onSelect(buildCarteraParametroSelectionKey(cartera))
        }
        fitToPanel
      />
    </div>
  );
};
