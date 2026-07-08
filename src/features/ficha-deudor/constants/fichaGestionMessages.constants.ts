interface BuildAgendaSuccessMessageParams {
  fecha: string;
  hora: string;
  usuario: string;
}

export const FICHA_GESTION_MESSAGES = {
  SAVE_SUCCESS: 'Gestión guardada exitosamente',
  SAVE_ERROR: 'No se pudo registrar la gestión. Inténtelo nuevamente.',
  AGENDA_REQUIRED: 'Por favor seleccione fecha y hora para agendar',
  WHATSAPP_PHONE_REQUIRED: 'Por favor seleccione un número de teléfono',
  WHATSAPP_DEFAULT_MESSAGE:
    'Hola, me comunico de [Empresa] respecto a su gestión.',

  buildAgendaSuccessMessage: ({
    fecha,
    hora,
    usuario,
  }: BuildAgendaSuccessMessageParams) => {
    return `Gestión agendada para: ${fecha} a las ${hora} por ${usuario}`;
  },
} as const;