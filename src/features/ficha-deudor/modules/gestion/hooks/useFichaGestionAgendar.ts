import { useCallback } from 'react';
import { FICHA_GESTION_MESSAGES } from '../constants/fichaGestionMessages.constants';
import type {
  GestionFormClaro,
  SetGestionField,
} from '../types/fichaGestion.types';

type GestionAgendaFormFields = Pick<
  GestionFormClaro,
  'fechaNuevaGestion' | 'horaNuevaGestion'
>;

interface UseFichaGestionAgendarParams {
  form: GestionAgendaFormFields;
  setField: SetGestionField;
  usuarioActual: string;
}

export const useFichaGestionAgendar = ({
  form,
  setField,
  usuarioActual,
}: UseFichaGestionAgendarParams) => {
  const handleAgendar = useCallback(() => {
    if (form.fechaNuevaGestion && form.horaNuevaGestion) {
    alert(
        FICHA_GESTION_MESSAGES.buildAgendaSuccessMessage({
        fecha: form.fechaNuevaGestion,
        hora: form.horaNuevaGestion,
        usuario: usuarioActual,
        })
    );
      setField('fechaGestion', form.fechaNuevaGestion);
      setField('horaGestion', form.horaNuevaGestion);
      return;
    }

    alert(FICHA_GESTION_MESSAGES.AGENDA_REQUIRED);
  }, [
    form.fechaNuevaGestion,
    form.horaNuevaGestion,
    setField,
    usuarioActual,
  ]);

  return {
    handleAgendar,
  };
};