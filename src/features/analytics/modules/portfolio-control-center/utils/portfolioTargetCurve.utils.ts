const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseIsoDate = (value: string): Date | null => {
  const match = ISO_DATE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const toIsoDate = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const isBusinessDay = (
  date: Date,
  holidays: ReadonlySet<string>
): boolean => {
  const day = date.getUTCDay();

  return (
    day !== 0 &&
    day !== 6 &&
    !holidays.has(toIsoDate(date))
  );
};

const countBusinessDays = (
  start: Date,
  end: Date,
  holidays: ReadonlySet<string>
): number => {
  if (start > end) {
    return 0;
  }

  const cursor = new Date(start);
  let total = 0;

  while (cursor <= end) {
    if (isBusinessDay(cursor, holidays)) {
      total += 1;
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return total;
};

export const calculateBusinessDayProgress = (
  period: string,
  holidays: readonly string[] = []
): number => {
  const date = parseIsoDate(period);

  if (!date) {
    return 0;
  }

  const monthStart = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1
    )
  );
  const monthEnd = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0
    )
  );
  const holidaySet = new Set(holidays);
  const totalBusinessDays = countBusinessDays(
    monthStart,
    monthEnd,
    holidaySet
  );

  if (totalBusinessDays === 0) {
    return 0;
  }

  const elapsedBusinessDays = countBusinessDays(
    monthStart,
    date,
    holidaySet
  );

  return Math.min(
    elapsedBusinessDays / totalBusinessDays,
    1
  );
};

export const calculateExpectedRecoveryAmount = (
  monthlyTargetAmount: number,
  period: string,
  holidays: readonly string[] = []
): number => {
  if (monthlyTargetAmount <= 0) {
    return 0;
  }

  return (
    monthlyTargetAmount *
    calculateBusinessDayProgress(period, holidays)
  );
};
