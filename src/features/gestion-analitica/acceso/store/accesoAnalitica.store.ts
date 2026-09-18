import type {
  AccesoAnaliticaContext,
} from '../domain/accesoAnalitica.types';

// UX-only freshness window. The backend reauthorizes every protected request;
// this cache must never be treated as a security decision.
export const GESTION_ANALITICA_ACCESS_CACHE_TTL_MS =
  2 * 60 * 1000;

interface AccesoAnaliticaCacheEntry {
  value: AccesoAnaliticaContext;
  cachedAt: number;
}

const accessByOption =
  new Map<number, AccesoAnaliticaCacheEntry>();

const getEntry = (
  optionId: number
): AccesoAnaliticaCacheEntry | null =>
  accessByOption.get(optionId) ?? null;

export const accesoAnaliticaStore = {
  getAccess(
    optionId: number
  ): AccesoAnaliticaContext | null {
    return getEntry(optionId)?.value ?? null;
  },

  getFreshAccess(
    optionId: number,
    now = Date.now()
  ): AccesoAnaliticaContext | null {
    const entry = getEntry(optionId);

    if (
      !entry ||
      now - entry.cachedAt >=
        GESTION_ANALITICA_ACCESS_CACHE_TTL_MS
    ) {
      return null;
    }

    return entry.value;
  },

  isStale(
    optionId: number,
    now = Date.now()
  ): boolean {
    const entry = getEntry(optionId);

    return (
      !entry ||
      now - entry.cachedAt >=
        GESTION_ANALITICA_ACCESS_CACHE_TTL_MS
    );
  },

  setAccess(
    optionId: number,
    value: AccesoAnaliticaContext,
    cachedAt = Date.now()
  ): void {
    accessByOption.set(
      optionId,
      {
        value,
        cachedAt,
      }
    );
  },

  clear(
    optionId?: number
  ): void {
    if (optionId === undefined) {
      accessByOption.clear();
      return;
    }

    accessByOption.delete(optionId);
  },
};
