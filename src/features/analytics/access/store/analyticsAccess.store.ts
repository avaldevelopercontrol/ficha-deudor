import type {
  AnalyticsAccessContext,
} from '../types/analyticsAccess.types';

// UX-only freshness window. The backend reauthorizes every protected request;
// this cache must never be treated as a security decision.
export const ANALYTICS_ACCESS_CACHE_TTL_MS =
  2 * 60 * 1000;

interface AnalyticsAccessCacheEntry {
  value: AnalyticsAccessContext;
  cachedAt: number;
}

const accessByOption =
  new Map<number, AnalyticsAccessCacheEntry>();

const getEntry = (
  optionId: number
): AnalyticsAccessCacheEntry | null =>
  accessByOption.get(optionId) ?? null;

export const analyticsAccessStore = {
  getAccess(
    optionId: number
  ): AnalyticsAccessContext | null {
    return getEntry(optionId)?.value ?? null;
  },

  getFreshAccess(
    optionId: number,
    now = Date.now()
  ): AnalyticsAccessContext | null {
    const entry = getEntry(optionId);

    if (
      !entry ||
      now - entry.cachedAt >=
        ANALYTICS_ACCESS_CACHE_TTL_MS
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
        ANALYTICS_ACCESS_CACHE_TTL_MS
    );
  },

  setAccess(
    optionId: number,
    value: AnalyticsAccessContext,
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
