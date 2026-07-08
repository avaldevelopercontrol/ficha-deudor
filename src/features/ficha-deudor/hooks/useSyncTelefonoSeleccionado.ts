import { useEffect } from 'react';

import type { SetGestionField } from '../types/fichaGestion.types';

interface UseSyncTelefonoSeleccionadoParams {
  telefonoSeleccionado?: string;
  telefonoActual: string;
  setField: SetGestionField;
}

export const useSyncTelefonoSeleccionado = ({
  telefonoSeleccionado,
  telefonoActual,
  setField,
}: UseSyncTelefonoSeleccionadoParams) => {
  useEffect(() => {
    const telefono = telefonoSeleccionado?.trim();

    if (telefono && telefono !== telefonoActual) {
      setField('telefono', telefono);
    }
  }, [telefonoSeleccionado, telefonoActual, setField]);
};  