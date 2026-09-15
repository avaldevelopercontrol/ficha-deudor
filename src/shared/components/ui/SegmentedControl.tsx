import type { ReactNode } from 'react';

import '../../styles/components/segmented-control.css';

export interface SegmentedControlOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps<TValue extends string> {
  value: TValue;
  options: readonly SegmentedControlOption<TValue>[];
  onChange: (value: TValue) => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const SegmentedControl = <TValue extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
  disabled = false,
}: SegmentedControlProps<TValue>) => (
  <div
    className={`segmented-control ${className}`.trim()}
    role="group"
    aria-label={ariaLabel}
  >
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={value === option.value ? 'is-active' : ''}
        aria-pressed={value === option.value}
        disabled={disabled || option.disabled}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);
