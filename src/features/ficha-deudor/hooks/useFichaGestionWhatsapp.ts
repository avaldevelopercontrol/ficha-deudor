import { useCallback } from 'react';
import { FICHA_GESTION_MESSAGES } from '../constants/fichaGestionMessages.constants';

interface UseFichaGestionWhatsappParams {
  telefono: string;
}

export const useFichaGestionWhatsapp = ({
  telefono,
}: UseFichaGestionWhatsappParams) => {
  const handleOpenWhatsApp = useCallback(() => {
    const telefonoLimpio = telefono.replace(/\D/g, '');

    if (!telefonoLimpio) {
      alert(FICHA_GESTION_MESSAGES.WHATSAPP_PHONE_REQUIRED);
      return;
    }

    const mensaje = encodeURIComponent(
        FICHA_GESTION_MESSAGES.WHATSAPP_DEFAULT_MESSAGE
    );

    window.open(`https://wa.me/${telefonoLimpio}?text=${mensaje}`, '_blank');
  }, [telefono]);

  return {
    handleOpenWhatsApp,
  };
};