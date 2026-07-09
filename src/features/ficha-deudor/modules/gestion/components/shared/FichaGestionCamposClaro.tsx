import React from 'react';

import { SelectField } from '@shared/components/ui';
import type { FichaGestionResultadosLlamadaProps } from '../../types/fichaGestion.types';

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
  const estadoGestionClaroPlaceholder = isLoadingEstadoGestionClaro
    ? 'Cargando Estado Gestión Claro...'
    : 'Seleccionar Estado Gestión Claro...';

  const motivoNoPagoPlaceholder = isLoadingMotivoNoPago
    ? 'Cargando Motivo No Pago...'
    : 'Seleccionar Motivo No Pago...';

  const handleEstadoGestionClaroChange = (value: string) => {
    setField('estadoGestionClaro', value);
  };

  const handleMotivoNoPagoChange = (value: string) => {
    setField('motivoNoPago', value);
  };

  return (
    <div className="gestion-compact-grid gestion-compact-grid--claro-resultados">
      <SelectField
        label="Estado Gestión Claro:"
        options={estadoGestionClaroOptions}
        value={form.estadoGestionClaro}
        onChange={handleEstadoGestionClaroChange}
        placeholder={estadoGestionClaroPlaceholder}
        disabled={isLoadingEstadoGestionClaro}
        error={errorEstadoGestionClaro || ''}
      />

      <SelectField
        label="Motivo No Pago:"
        options={motivoNoPagoOptions}
        value={form.motivoNoPago}
        onChange={handleMotivoNoPagoChange}
        placeholder={motivoNoPagoPlaceholder}
        disabled={isLoadingMotivoNoPago}
        error={errorMotivoNoPago || ''}
      />
    </div>
  );
};

export default FichaGestionCamposClaro;