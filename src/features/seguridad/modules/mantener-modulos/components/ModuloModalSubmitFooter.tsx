import type {
  ReactNode,
} from 'react';

import {
  ActionButton,
} from '@shared/components/ui';

interface ModuloModalSubmitFooterProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
  title?: string;
  onSubmit: () => void | Promise<void>;
}

export const ModuloModalSubmitFooter = ({
  label,
  loadingLabel,
  loading,
  disabled,
  title,
  onSubmit,
}: ModuloModalSubmitFooterProps): ReactNode => (
  <footer className="registrar-modulo-modal__footer">
    <ActionButton
      label={label}
      loadingLabel={loadingLabel}
      loading={loading}
      variant="primary"
      size="md"
      icon="✓"
      onClick={() => {
        void onSubmit();
      }}
      disabled={disabled}
      title={title}
      className="registrar-modulo-modal__submit-button"
    />
  </footer>
);

export default ModuloModalSubmitFooter;
