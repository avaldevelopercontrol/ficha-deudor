import type React from 'react';

import {
  CambiarClaveFormView,
} from '../../cambiar-clave/components/CambiarClaveFormView';
import {
  useCambiarClaveExpiradaForm,
} from '../hooks/useCambiarClaveExpiradaForm';

export const CambiarClaveExpiradaForm: React.FC = () => {
  const formState = useCambiarClaveExpiradaForm();

  return (
    <CambiarClaveFormView
      {...formState}
      title="Actualización obligatoria de clave"
      description="Su clave de acceso ha expirado. Registre una nueva clave que cumpla todos los requisitos para continuar."
      formAriaLabel="Formulario para actualizar clave expirada"
      submitLabel="Cambiar clave"
    />
  );
};

export default CambiarClaveExpiradaForm;
