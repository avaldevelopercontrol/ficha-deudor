import type { AnalyticsScope } from '../types/analyticsAccess.types';

interface Props {
  scopes: readonly AnalyticsScope[];
  value: number | null;
  onChange: (value: number) => void;
}

export function CrmClientSelector({
  scopes,
  value,
  onChange,
}: Props) {
  if (scopes.length <= 1) {
    return null;
  }

  return (
    <select
      value={value ?? ''}
      onChange={(event) => {
        const nextValue = Number(event.target.value);

        if (Number.isSafeInteger(nextValue) && nextValue > 0) {
          onChange(nextValue);
        }
      }}
      aria-label="Seleccionar cartera Analytics"
    >
      <option value="">Seleccione cartera</option>
      {scopes.map((scope) => (
        <option
          key={scope.crmClientId}
          value={scope.crmClientId}
        >
          {scope.name || `Cartera ${scope.crmClientId}`}
        </option>
      ))}
    </select>
  );
}
