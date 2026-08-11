import type {
  CSSProperties,
  ReactNode,
} from 'react';

import type {
  AccesosOpcionesFormData,
  OpcionTreeItem,
} from '../types/asignarAccesosPerfil.types';

import {
  getConfigurableBranchOptionIds,
} from '../utils/accesosPerfilTree.utils';

import {
  getPerfilOpcionBranchSelectionState,
} from '../utils/asignarAccesosPerfil.utils';

import AccessStateCheckbox from './AccessStateCheckbox';

interface AccesosPerfilTreeProps {
  items: readonly OpcionTreeItem[];
  form: AccesosOpcionesFormData;
  disabled?: boolean;
  onActivate: (optionId: number) => void;
  onToggle: (
    optionId: number,
    selected: boolean
  ) => void;
}

interface TreeRowStyle
  extends CSSProperties {
  '--access-option-depth': number;
}

export const AccesosPerfilTree = ({
  items,
  form,
  disabled = false,
  onActivate,
  onToggle,
}: AccesosPerfilTreeProps): ReactNode => (
  <div
    className="asignar-accesos-tree"
    role="tree"
    aria-label="Opciones disponibles"
  >
    {items.map((item) => {
      const selectionState =
        getPerfilOpcionBranchSelectionState(
          form,
          items,
          item.idModulo
        );
      const isActive =
        form.activeOptionId ===
        item.idModulo;
      const branchIds =
        getConfigurableBranchOptionIds(
          items,
          item.idModulo
        );
      const isDisabled =
        disabled ||
        branchIds.length === 0;

      const rowStyle: TreeRowStyle = {
        '--access-option-depth':
          item.depth,
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
              onToggle(
                item.idModulo,
                checked
              );
            }}
          />

          <button
            type="button"
            className="asignar-accesos-tree__label"
            onClick={() => {
              onActivate(
                item.idModulo
              );
            }}
            title={item.displayLabel}
          >
            <span
              className="asignar-accesos-tree__text"
            >
              {item.displayLabel}
            </span>
          </button>
        </div>
      );
    })}
  </div>
);

export default AccesosPerfilTree;
