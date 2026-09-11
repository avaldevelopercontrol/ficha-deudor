import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  AccessCheckState,
  AccessOptionsFormData,
  AccessTreeItem,
} from './access.types';
import {
  getConfigurableBranchOptionIds,
} from './accessTree.utils';
import {
  getAccessPermissions,
  getSelectedLeafIds,
  keepSelectedLeafPermissions,
  resolveAccessCheckState,
  resolveSelectedAccessAssignmentIds,
} from './accessFormState.utils';

export interface AccessBranchSelectionSummary {
  state: AccessCheckState;
  configurableOptionCount: number;
  selectedOptionCount: number;
}

interface MutableAccessBranchSelectionCounts {
  configurableOptionCount: number;
  selectedOptionCount: number;
}

/**
 * Calcula el estado de selección de todas las ramas en una sola pasada.
 *
 * AccessTree se renderiza como una lista preordenada. Antes cada fila volvía a
 * recorrer su rama y la lista completa de seleccionados, lo que multiplicaba
 * el trabajo a medida que crecía el árbol. Este índice reutiliza la relación
 * padre/hijo ya presente en cada item y agrega los conteos de abajo hacia arriba.
 */
export const buildAccessBranchSelectionSummaryIndex = (
  selectedOptionIds: readonly number[],
  treeItems: readonly AccessTreeItem[]
): ReadonlyMap<number, AccessBranchSelectionSummary> => {
  const selectedIds = new Set(
    selectedOptionIds
  );
  const treeItemIds = new Set(
    treeItems.map((item) => item.idModulo)
  );
  const countsByOptionId = new Map<
    number,
    MutableAccessBranchSelectionCounts
  >();

  for (
    let index = treeItems.length - 1;
    index >= 0;
    index -= 1
  ) {
    const item = treeItems[index];

    if (!item) {
      continue;
    }

    const counts =
      countsByOptionId.get(item.idModulo) ?? {
        configurableOptionCount: 0,
        selectedOptionCount: 0,
      };

    if (item.isPermissionTarget) {
      counts.configurableOptionCount += 1;

      if (selectedIds.has(item.idModulo)) {
        counts.selectedOptionCount += 1;
      }
    }

    countsByOptionId.set(
      item.idModulo,
      counts
    );

    if (
      item.idPadre > 0 &&
      treeItemIds.has(item.idPadre)
    ) {
      const parentCounts =
        countsByOptionId.get(item.idPadre) ?? {
          configurableOptionCount: 0,
          selectedOptionCount: 0,
        };

      parentCounts.configurableOptionCount +=
        counts.configurableOptionCount;
      parentCounts.selectedOptionCount +=
        counts.selectedOptionCount;

      countsByOptionId.set(
        item.idPadre,
        parentCounts
      );
    }
  }

  return new Map(
    treeItems.map((item) => {
      const counts =
        countsByOptionId.get(item.idModulo) ?? {
          configurableOptionCount: 0,
          selectedOptionCount: 0,
        };

      return [
        item.idModulo,
        {
          ...counts,
          state: resolveAccessCheckState(
            counts.selectedOptionCount,
            counts.configurableOptionCount
          ),
        },
      ];
    })
  );
};

export const getAccessBranchSelectionState = (
  form: AccessOptionsFormData,
  treeItems: readonly AccessTreeItem[],
  optionId: number
): AccessCheckState =>
  buildAccessBranchSelectionSummaryIndex(
    form.selectedOptionIds,
    treeItems
  ).get(optionId)?.state ?? 'unchecked';

export const setAccessBranchSelected = <
  T extends AccessOptionsFormData,
>(
  form: T,
  treeItems: readonly AccessTreeItem[],
  optionId: number,
  selected: boolean
): T => {
  const normalizedOptionId =
    toRequiredId(optionId, 'nId_Opcion');
  const branchLeafIds =
    getConfigurableBranchOptionIds(
      treeItems,
      normalizedOptionId
    );

  if (branchLeafIds.length === 0) {
    return {
      ...form,
      activeOptionId: normalizedOptionId,
    };
  }

  const selectedLeafIds = new Set(
    getSelectedLeafIds(form, treeItems)
  );
  const permissionsByOptionId = {
    ...form.permissionsByOptionId,
  };

  branchLeafIds.forEach((id) => {
    if (selected) {
      selectedLeafIds.add(id);
      permissionsByOptionId[String(id)] =
        getAccessPermissions(form, id);
      return;
    }

    selectedLeafIds.delete(id);
    delete permissionsByOptionId[String(id)];
  });

  return {
    ...form,
    activeOptionId: normalizedOptionId,
    selectedOptionIds:
      resolveSelectedAccessAssignmentIds(
        [...selectedLeafIds],
        treeItems
      ),
    permissionsByOptionId:
      keepSelectedLeafPermissions(
        permissionsByOptionId,
        selectedLeafIds
      ),
  };
};
