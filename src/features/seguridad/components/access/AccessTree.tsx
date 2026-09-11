import {
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';

import type {
  AccessOptionsFormData,
  AccessTreeItem,
} from '../../domain/accesos/access.types';

import {
  buildAccessBranchSelectionSummaryIndex,
} from '../../domain/accesos/accessSelection.utils';

import AccessStateCheckbox from './AccessStateCheckbox';

interface AccessTreeProps {
  items: readonly AccessTreeItem[];
  form: AccessOptionsFormData;
  disabled?: boolean;
  onActivate: (optionId: number) => void;
  onToggle: (
    optionId: number,
    selected: boolean
  ) => void;
}

interface TreeRowStyle extends CSSProperties {
  '--access-option-depth': number;
}

export const AccessTree = ({
  items,
  form,
  disabled = false,
  onActivate,
  onToggle,
}: AccessTreeProps): ReactNode => {
  const branchSelectionByOptionId = useMemo(
    () =>
      buildAccessBranchSelectionSummaryIndex(
        form.selectedOptionIds,
        items
      ),
    [form.selectedOptionIds, items]
  );

  return (
    <div
      className="asignar-accesos-tree"
      role="tree"
      aria-label="Opciones disponibles"
    >
      {items.map((item) => {
        const branchSelection =
          branchSelectionByOptionId.get(
            item.idModulo
          );
        const selectionState =
          branchSelection?.state ?? 'unchecked';
        const isActive =
          form.activeOptionId === item.idModulo;
        const isDisabled =
          disabled ||
          (branchSelection?.configurableOptionCount ?? 0) === 0;

        const rowStyle: TreeRowStyle = {
          '--access-option-depth': item.depth,
        };

        return (
          <div
            key={item.idModulo}
            className={[
              'asignar-accesos-tree__row',
              isActive
                ? 'asignar-accesos-tree__row--active'
                : '',
              selectionState !== 'unchecked'
                ? 'asignar-accesos-tree__row--selected'
                : '',
              selectionState === 'mixed'
                ? 'asignar-accesos-tree__row--mixed'
                : '',
              !item.isAssignmentTarget
                ? 'asignar-accesos-tree__row--global'
                : '',
              isDisabled
                ? 'asignar-accesos-tree__row--disabled'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={rowStyle}
            role="treeitem"
            aria-selected={isActive}
            aria-level={item.depth + 1}
          >
            <AccessStateCheckbox
              state={selectionState}
              disabled={isDisabled}
              className="asignar-accesos-tree__checkbox"
              ariaLabel={`Asignar ${item.displayLabel}`}
              onChange={(checked) => {
                onToggle(item.idModulo, checked);
              }}
            />

            <button
              type="button"
              className="asignar-accesos-tree__label"
              onClick={() => {
                onActivate(item.idModulo);
              }}
              title={item.displayLabel}
            >
              <span className="asignar-accesos-tree__text">
                {item.displayLabel}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AccessTree;
