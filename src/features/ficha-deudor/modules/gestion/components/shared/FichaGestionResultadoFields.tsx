import React from 'react';

import {
  TextAreaField,
  CheckboxField,
} from '@shared/components/ui';
import type { FichaGestionResultadosLlamadaProps } from '../../types/fichaGestion.types';

type Props = Pick<FichaGestionResultadosLlamadaProps, 'form' | 'setField'>;

const FichaGestionResultadoFields: React.FC<Props> = ({ form, setField }) => {
  const handleGestionTerminadaChange = (value: boolean) => {
    setField('gestionTerminada', value);
  };

  const handleObservacionesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setField('observaciones', event.target.value);
  };

  return (
    <>
      <div className="gestion-compact-grid gestion-compact-grid--resultados">
        <CheckboxField
          label="Gestión Terminada:"
          checked={form.gestionTerminada}
          onChange={handleGestionTerminadaChange}
        />
      </div>

      <TextAreaField
        label="Observaciones:"
        value={form.observaciones}
        onChange={handleObservacionesChange}
        rows={3}
        placeholder="Ingrese las observaciones de la gestión..."
      />
    </>
  );
};

export default FichaGestionResultadoFields;