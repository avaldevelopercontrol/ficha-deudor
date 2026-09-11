import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control/registry/applicationOptionIds';
import type {
  AuthorizedOption,
} from '@features/access-control/types/accessControl.types';

import type {
  PowerBiReport,
  ReporteriaCatalog,
} from '../domain/reporteria.types';

const findAuthorizedOptionById = (
  options: readonly AuthorizedOption[],
  optionId: number
): AuthorizedOption | null => {
  for (const option of options) {
    if (option.id === optionId) {
      return option;
    }

    const child = findAuthorizedOptionById(
      option.children,
      optionId
    );

    if (child) {
      return child;
    }
  }

  return null;
};

const mapAuthorizedReport = (
  option: AuthorizedOption
): PowerBiReport => ({
  id: option.id,
  code: option.code,
  name: option.name,
  description: option.description,
  serviceUrl: option.urlBI,
  image: option.image,
  email: option.email ?? null,
  icon: option.icon,
});

export const adaptAccessControlToReporteriaCatalog = (
  menuTree: readonly AuthorizedOption[]
): ReporteriaCatalog => {
  const reporteria = findAuthorizedOptionById(
    menuTree,
    APPLICATION_OPTION_IDS.REPORTERIA
  );

  if (!reporteria) {
    return {
      section: null,
      parentName: null,
      reports: [],
    };
  }

  const parent = findAuthorizedOptionById(
    menuTree,
    reporteria.parentId
  );

  return {
    section: {
      id: reporteria.id,
      name: reporteria.name,
      description: reporteria.description,
      parentId: reporteria.parentId,
    },
    parentName: parent?.name ?? null,
    reports: reporteria.children
      .filter(
        (option) =>
          option.parentId === reporteria.id &&
          option.permissions.consultar
      )
      .map(mapAuthorizedReport),
  };
};
