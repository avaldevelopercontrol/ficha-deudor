import React from 'react';

import { SearchableSelectField } from '@shared/components/ui';

import type { FichaGestionResultadosLlamadaProps } from '../../types/fichaGestionViewModel.types';

type Props = Pick<
  FichaGestionResultadosLlamadaProps,
  | 'form'
  | 'setField'
  | 'estadoGestionClaroOptions'
  | 'isLoadingEstadoGestionClaro'
  | 'errorEstadoGestionClaro'
  | 'motivoNoPagoOptions'
  | 'isLoadingMotivoNoPago'
  | 'errorMotivoNoPago'
>;

const FichaGestionCamposClaro: React.FC<Props> = ({
  form,
  setField,
  estadoGestionClaroOptions,
  isLoadingEstadoGestionClaro,
  errorEstadoGestionClaro,
  motivoNoPagoOptions,
  isLoadingMotivoNoPago,
  errorMotivoNoPago,
}) => {
  const estadoGestionClaroPlaceholder =
    isLoadingEstadoGestionClaro
      ? 'Cargando Estado Gestión Claro...'
      : 'Seleccionar Estado Gestión Claro...';

  const motivoNoPagoPlaceholder =
    isLoadingMotivoNoPago
      ? 'Cargando Motivo No Pago...'
      : 'Seleccionar Motivo No Pago...';

  const handleEstadoGestionClaroChange = (
    value: string
  ) => {
    setField(
      'estadoGestionClaro',
      value
    );
  };

  const handleMotivoNoPagoChange = (
    value: string
  ) => {
    setField(
      'motivoNoPago',
      value
    );
  };

  return (
    <div className="resultados-llamada__campos-claro">
      <SearchableSelectField
        label="Estado Gestión Claro:"
        options={estadoGestionClaroOptions}
        value={form.estadoGestionClaro}
        onChange={handleEstadoGestionClaroChange}
        placeholder={estadoGestionClaroPlaceholder}
        searchPlaceholder="Buscar estado de gestión Claro..."
        emptyMessage="No se encontraron estados de gestión Claro."
        disabled={isLoadingEstadoGestionClaro}
        error={errorEstadoGestionClaro || ''}
      />

      <SearchableSelectField
        label="Motivo No Pago:"
        options={motivoNoPagoOptions}
        value={form.motivoNoPago}
        onChange={handleMotivoNoPagoChange}
        placeholder={motivoNoPagoPlaceholder}
        searchPlaceholder="Buscar motivo de no pago..."
        emptyMessage="No se encontraron motivos de no pago."
        disabled={isLoadingMotivoNoPago}
        error={errorMotivoNoPago || ''}
      />
    </div>
  );
};

export default FichaGestionCamposClaro;