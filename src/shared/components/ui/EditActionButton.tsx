import type React from 'react';

import { ActionButton } from './ActionButton';

interface EditActionButtonProps {
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const EditActionButton: React.FC<EditActionButtonProps> = ({
  ariaLabel,
  title = 'Editar',
  disabled = false,
  onClick,
}) => {
  return (
    <ActionButton
      label=""
      icon="✎"
      variant="primary"
      size="sm"
      ariaLabel={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export default EditActionButton;