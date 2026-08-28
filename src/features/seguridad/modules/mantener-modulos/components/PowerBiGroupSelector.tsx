import type {
  ReactNode,
} from 'react';

import type {
  Grupo,
} from '@features/seguridad/types/grupo.types';

import {
  SelectField,
} from '@shared/components/ui';

import type {
  SelectOption,
} from '@shared/types';

interface PowerBiGroupSelectorProps {
  groups: readonly Grupo[];
  value: readonly number[];
  onChange: (
    groupIds: number[]
  ) => void;
  disabled?: boolean;
  error?: string | null;
}

const buildGroupLabel = (
  group: Grupo
): string =>
  group.nombreGrupo.trim() ||
  `Grupo #${group.idGrupo}`;

export const PowerBiGroupSelector = ({
  groups,
  value,
  onChange,
  disabled = false,
  error = null,
}: PowerBiGroupSelectorProps): ReactNode => {
  const selectedGroupId =
    value.length === 1
      ? value[0]
      : 0;

  const sortedGroups = [
    ...groups,
  ].sort(
    (a, b) =>
      buildGroupLabel(a).localeCompare(
        buildGroupLabel(b),
        'es-PE',
        {
          sensitivity: 'base',
        }
      )
  );

  const knownGroupIds =
    new Set(
      sortedGroups.map(
        (group) =>
          group.idGrupo
      )
    );

  const unavailableSelectedIds =
    value
      .filter(
        (groupId) =>
          !knownGroupIds.has(
            groupId
          )
      )
      .sort(
        (a, b) => a - b
      );

  const options:
    SelectOption<number>[] = [
      ...sortedGroups.map(
        (group) => ({
          id: group.idGrupo,
          label:
            buildGroupLabel(group),
        })
      ),
      ...unavailableSelectedIds.map(
        (groupId) => ({
          id: groupId,
          label:
            `Grupo #${groupId} (actualmente no disponible)`,
        })
      ),
    ];

  return (
    <SelectField<number>
      label="Grupo asociado"
      layout="inline"
      value={selectedGroupId}
      options={options}
      placeholder="Seleccione un grupo"
      onChange={(groupId) => {
        if (
          !Number.isSafeInteger(
            groupId
          ) ||
          groupId <= 0
        ) {
          onChange([]);
          return;
        }

        onChange([
          groupId,
        ]);
      }}
      error={
        error ?? undefined
      }
      disabled={
        disabled ||
        options.length === 0
      }
      required
    />
  );
};

export default PowerBiGroupSelector;
