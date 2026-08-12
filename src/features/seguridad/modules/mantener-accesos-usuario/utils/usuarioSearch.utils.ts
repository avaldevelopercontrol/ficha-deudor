import type {
  UsuarioListado,
} from '@features/gestion-usuarios/types/usuarioListado.types';

export interface UsuarioSearchOption {
  id: number;
  label: string;
  login: string;
  searchText: string;
  normalizedLabel: string;
  normalizedLogin: string;
}

export interface UsuarioSearchResult {
  options: UsuarioSearchOption[];
  totalMatches: number;
}

export const USUARIO_SEARCH_RESULT_LIMIT = 50;

const normalizeSearchText = (
  value: string
): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-PE')
    .replace(/\s+/g, ' ')
    .trim();

const getUsuarioLabel = (
  usuario: UsuarioListado
): string =>
  usuario.nombre ||
  usuario.login ||
  `Usuario ${usuario.id}`;

export const isUsuarioListadoActivo = (
  usuario: UsuarioListado
): boolean =>
  usuario.estado
    .trim()
    .toLocaleUpperCase('es-PE') ===
  'ACTIVO';

export const buildUsuarioSearchOptions = (
  usuarios: UsuarioListado[]
): UsuarioSearchOption[] =>
  usuarios
    .filter(
      (usuario) =>
        Number.isSafeInteger(usuario.id) &&
        usuario.id > 0
    )
    .map((usuario) => {
      const label = getUsuarioLabel(usuario);
      const login =
        usuario.login &&
        usuario.login !== label
          ? usuario.login
          : '';

      const normalizedLabel =
        normalizeSearchText(label);
      const normalizedLogin =
        normalizeSearchText(login);

      return {
        id: usuario.id,
        label,
        login,
        normalizedLabel,
        normalizedLogin,
        searchText: [
          normalizedLabel,
          normalizedLogin,
          String(usuario.id),
        ]
          .filter(Boolean)
          .join(' '),
      };
    })
    .sort((left, right) =>
      left.label.localeCompare(
        right.label,
        'es',
        {
          sensitivity: 'base',
        }
      )
    );

export const buildActiveUsuarioSearchOptions = (
  usuarios: UsuarioListado[]
): UsuarioSearchOption[] =>
  buildUsuarioSearchOptions(
    usuarios.filter(
      isUsuarioListadoActivo
    )
  );

const getSearchScore = (
  option: UsuarioSearchOption,
  normalizedQuery: string
): number => {
  if (
    option.normalizedLogin &&
    option.normalizedLogin === normalizedQuery
  ) {
    return 0;
  }

  if (
    option.normalizedLabel === normalizedQuery
  ) {
    return 1;
  }

  if (
    option.normalizedLogin.startsWith(
      normalizedQuery
    )
  ) {
    return 2;
  }

  if (
    option.normalizedLabel.startsWith(
      normalizedQuery
    )
  ) {
    return 3;
  }

  return 4;
};

export const searchUsuarioOptions = (
  options: UsuarioSearchOption[],
  query: string,
  limit = USUARIO_SEARCH_RESULT_LIMIT
): UsuarioSearchResult => {
  const normalizedQuery =
    normalizeSearchText(query);

  const safeLimit = Math.max(
    1,
    Math.trunc(limit)
  );

  if (!normalizedQuery) {
    return {
      options: options.slice(0, safeLimit),
      totalMatches: options.length,
    };
  }

  const queryTokens = normalizedQuery
    .split(' ')
    .filter(Boolean);

  const matches = options
    .filter((option) =>
      queryTokens.every((token) =>
        option.searchText.includes(token)
      )
    )
    .map((option) => ({
      option,
      score: getSearchScore(
        option,
        normalizedQuery
      ),
    }))
    .sort(
      (left, right) =>
        left.score - right.score ||
        left.option.label.localeCompare(
          right.option.label,
          'es',
          {
            sensitivity: 'base',
          }
        )
    );

  return {
    options: matches
      .slice(0, safeLimit)
      .map(({ option }) => option),
    totalMatches: matches.length,
  };
};
