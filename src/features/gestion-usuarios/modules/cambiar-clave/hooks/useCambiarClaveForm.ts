import {
  APPLICATION_OPTION_IDS,
  useOptionPermissions,
} from '@features/access-control';
import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  useCambiarClaveFormController,
} from './useCambiarClaveFormController';

export const useCambiarClaveForm = () => {
  const { usuario } = useAuth();
  const permissions = useOptionPermissions(
    APPLICATION_OPTION_IDS.CAMBIAR_CLAVE
  );

  return useCambiarClaveFormController({
    userId: usuario?.id_usuario,
    canEdit: permissions.editar,
  });
};
