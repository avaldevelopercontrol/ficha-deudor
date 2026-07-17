import React from 'react';

import {
  CheckboxField,
  TextAreaField,
} from '@shared/components/ui';

import type { FichaGestionResultadosLlamadaProps } from '../../types/fichaGestion.types';

type Props = Pick<
  FichaGestionResultadosLlamadaProps,
  'form' | 'setField'
>;

const FichaGestionResultadoFields: React.FC<Props> = ({
  form,
  setField,
}) => {
  const handleGestionTerminadaChange = (
    value: boolean
  ) => {
    setField('gestionTerminada', value);
  };

  const handleObservacionesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setField(
      'observaciones',
      event.target.value
    );
  };

  return (
    <div className="resultados-llamada__principal">
      <div className="resultados-llamada__terminada">
        <CheckboxField
          label="Gestión Terminada:"
          checked={form.gestionTerminada}
          onChange={
            handleGestionTerminadaChange
          }
        />
      </div>

      <div className="resultados-llamada__observaciones">
        <TextAreaField
          label="Observaciones:"
          value={form.observaciones}
          onChange={handleObservacionesChange}
          rows={3}
          placeholder="Ingrese las observaciones de la gestión..."
          spellCheck
          autoCorrect="on"
          autoCapitalize="sentences"
          lang="es-PE"
        />
      </div>
    </div>
  );
};

export default FichaGestionResultadoFields;