import React from 'react';
import { ActionButton } from '@shared/components/ui';

interface Props {
  pageNumber: number;
  totalPages: number;
  buttonLabel: string;
  onAdd: () => void;
  icon?: string;
}

const PanelTablaHeaderActions: React.FC<Props> = ({
  pageNumber,
  totalPages,
  buttonLabel,
  onAdd,
  icon = '＋',
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '12px', color: '#6b7a99' }}>
        Página {pageNumber} de {totalPages}
      </span>

      <ActionButton
        label={buttonLabel}
        variant="primary"
        size="sm"
        icon={icon}
        onClick={onAdd}
      />
    </div>
  );
};

export default PanelTablaHeaderActions;