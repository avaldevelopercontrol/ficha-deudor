import type React from 'react';

import {
  useCambiarClaveForm,
} from '../hooks/useCambiarClaveForm';
import {
  CambiarClaveFormView,
} from './CambiarClaveFormView';

export const CambiarClaveForm: React.FC = () => {
  const formState = useCambiarClaveForm();

  return <CambiarClaveFormView {...formState} />;
};

export default CambiarClaveForm;
