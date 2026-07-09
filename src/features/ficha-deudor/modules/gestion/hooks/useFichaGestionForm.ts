import { useCallback, useState } from 'react';
import type { GestionFormClaro } from '../types/fichaGestion.types';


const INITIAL_FICHA_GESTION_FORM: GestionFormClaro = {
  nombreContacto: '',
  cargo: '',
  np0: '',
  np1: '',
  np2: '',
  estadoGestion: '',
  telefono: '',
  tipoGestion: '',
  gestorId: '',
  gestorNombre: '',
  fechaCompromisoPago: '',
  compromisoSoles: '',
  compromisoUSD: '',
  fechaNuevaGestion: '',
  horaNuevaGestion: '',
  fechaGestion: '',
  horaGestion: '',
  gestionTerminada: false,
  observaciones: '',
  estadoGestionClaro: '',
  motivoNoPago: '',
};

export const useFichaGestionForm = () => {
  const [form, setForm] = useState<GestionFormClaro>(() => ({
    ...INITIAL_FICHA_GESTION_FORM,
  }));

  const setField = useCallback(
    <K extends keyof GestionFormClaro>(
      field: K,
      value: GestionFormClaro[K]
    ) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const setFields = useCallback((fields: Partial<GestionFormClaro>) => {
    setForm((prev) => ({
      ...prev,
      ...fields,
    }));
  }, []);

  const handleNP0Change = useCallback(
    (value: string) => {
      setFields({
        np0: value,
        np1: '',
        np2: '',
      });
    },
    [setFields]
  );

  const handleNP1Change = useCallback(
    (value: string) => {
      setFields({
        np1: value,
        np2: '',
      });
    },
    [setFields]
  );

  const resetForm = useCallback(() => {
    setForm({
      ...INITIAL_FICHA_GESTION_FORM,
    });
  }, []);

  return {
    form,
    setField,
    setFields,
    handleNP0Change,
    handleNP1Change,
    resetForm,
  };
};