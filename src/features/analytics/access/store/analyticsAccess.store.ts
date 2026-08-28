import type {
  AnalyticsAccessContext,
} from '../types/analyticsAccess.types';

const accessByOption =
  new Map<number, AnalyticsAccessContext>();

export const analyticsAccessStore = {
  getAccess(
    optionId: number
  ): AnalyticsAccessContext | null {
    return (
      accessByOption.get(optionId) ??
      null
    );
  },

  setAccess(
    optionId: number,
    value: AnalyticsAccessContext
  ): void {
    accessByOption.set(
      optionId,
      value
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
