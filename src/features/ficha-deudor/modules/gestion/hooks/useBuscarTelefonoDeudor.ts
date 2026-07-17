import { useCallback, useState } from 'react';

import type { TelefonoReferenciado } from '../../telefonos-referenciados/types/telefono.types';
import { normalizeTelefonoForComparison } from '../../telefonos-referenciados/utils/telefonoNormalization.utils';
import type { FichaGestionValidationErrors } from '../types/fichaGestion.types';
import { useAutoClearValidationErrors } from './useAutoClearValidationErrors';

interface UseBuscarTelefonoDeudorParams {
  telefonosReferenciados: TelefonoReferenciado[];
  isLoadingTelefonosReferenciados: boolean;
  telefonosReferenciadosError: string | null;
  telefonoSeleccionado?: string;
  onSelectTelefono: (telefono: string) => void;
}

interface TelefonoValidationState {
  errors: FichaGestionValidationErrors;
  telefonoSeleccionadoAlValidar: string;
}

const EMPTY_VALIDATION_ERRORS: FichaGestionValidationErrors = {};

export const useBuscarTelefonoDeudor = ({
  telefonosReferenciados,
  isLoadingTelefonosReferenciados,
  telefonosReferenciadosError,
  telefonoSeleccionado = '',
  onSelectTelefono,
}: UseBuscarTelefonoDeudorParams) => {
  const [isOpen, setIsOpen] = useState(false);
  const [telefonoIngresado, setTelefonoIngresado] = useState('');

  const [validationState, setValidationState] =
    useState<TelefonoValidationState>({
      errors: EMPTY_VALIDATION_ERRORS,
      telefonoSeleccionadoAlValidar: telefonoSeleccionado,
    });

  /*
   * Si posteriormente se selecciona otro teléfono desde la tabla,
   * el error anterior deja de mostrarse sin necesitar un useEffect.
   */
  const validationErrors =
    validationState.telefonoSeleccionadoAlValidar === telefonoSeleccionado
      ? validationState.errors
      : EMPTY_VALIDATION_ERRORS;

  const clearValidationErrors = useCallback(() => {
    setValidationState({
      errors: EMPTY_VALIDATION_ERRORS,
      telefonoSeleccionadoAlValidar: telefonoSeleccionado,
    });
  }, [telefonoSeleccionado]);

  useAutoClearValidationErrors({
    errors: validationErrors,
    onClear: clearValidationErrors,
  });

  const setTelefonoValidationError = useCallback(
    (message: string) => {
      setValidationState({
        errors: {
          telefono: message,
        },
        telefonoSeleccionadoAlValidar: telefonoSeleccionado,
      });
    },
    [telefonoSeleccionado]
  );

  const handleOpen = useCallback(() => {
    setTelefonoIngresado('');
    clearValidationErrors();
    setIsOpen(true);
  }, [clearValidationErrors]);

  const handleClose = useCallback(() => {
    setTelefonoIngresado('');
    setIsOpen(false);
  }, []);

  const handleTelefonoChange = useCallback((value: string) => {
    setTelefonoIngresado(value);
  }, []);

  const handleValidate = useCallback(() => {
    const telefonoNormalizado = normalizeTelefonoForComparison(
      telefonoIngresado
    );

    /*
     * El modal se cierra tanto cuando encuentra el teléfono como cuando
     * ocurre una validación, porque el error se mostrará dentro de la ficha.
     */
    setIsOpen(false);
    setTelefonoIngresado('');

    if (!telefonoNormalizado) {
      setTelefonoValidationError(
        'Ingrese el teléfono del deudor.'
      );
      return;
    }

    if (isLoadingTelefonosReferenciados) {
      setTelefonoValidationError(
        'La lista de teléfonos referenciados todavía se está cargando.'
      );
      return;
    }

    if (telefonosReferenciadosError) {
      setTelefonoValidationError(
        'No fue posible validar el teléfono porque la lista de teléfonos referenciados no está disponible.'
      );
      return;
    }

    const telefonoEncontrado = telefonosReferenciados.find(
      ({ numero }) =>
        normalizeTelefonoForComparison(numero) === telefonoNormalizado
    );

    if (!telefonoEncontrado) {
      setTelefonoValidationError(
        'El teléfono ingresado no se encuentra registrado para este deudor.'
      );
      return;
    }

    clearValidationErrors();

    /*
     * Se envía el número original, sin enmascarar.
     * Esta será la misma acción utilizada actualmente al hacer clic
     * en un teléfono de la tabla.
     */
    onSelectTelefono(telefonoEncontrado.numero);
  }, [
    clearValidationErrors,
    isLoadingTelefonosReferenciados,
    onSelectTelefono,
    setTelefonoValidationError,
    telefonoIngresado,
    telefonosReferenciados,
    telefonosReferenciadosError,
  ]);

  const handleClear = useCallback(() => {
    setTelefonoIngresado('');
    setIsOpen(false);

    clearValidationErrors();

    /*
    * También limpia el estado compartido de FichaDeudor.
    * El componente limpiará form.telefono mediante setField.
    */
    onSelectTelefono('');
    }, [
    clearValidationErrors,
    onSelectTelefono,
  ]);

  return {
    isOpen,
    telefonoIngresado,
    validationErrors,
    isSearchDisabled: isLoadingTelefonosReferenciados,
    handleOpen,
    handleClose,
    handleTelefonoChange,
    handleValidate,
    handleClear,
  };
};