import type { ReactNode } from 'react';

import { formatPortfolioInteger } from '../utils/portfolioControlCenter.formatters';

export interface PortfolioPromiseDistributionBucket<TKey extends string> {
  key: TKey;
  label: string;
  count: number;
}

interface PortfolioPromiseDistributionProps<TKey extends string> {
  className: string;
  title: string;
  description: string;
  cutoff: ReactNode;
  buckets: readonly PortfolioPromiseDistributionBucket<TKey>[];
  activeKey: string;
  maxCount: number;
  onToggle: (key: TKey) => void;
  getRowModifierClassName?: (key: TKey) => string | null;
}

export function PortfolioPromiseDistribution<TKey extends string>({
  className,
  title,
  description,
  cutoff,
  buckets,
  activeKey,
  maxCount,
  onToggle,
  getRowModifierClassName,
}: PortfolioPromiseDistributionProps<TKey>) {
  return (
    <section className={className}>
      <div className={`${className}__heading`}>
        <div>
          <span>{title}</span>
          <small>{description}</small>
        </div>
        {cutoff !== null && cutoff !== undefined && (
          <span className={`${className}__cutoff`}>
            {cutoff}
          </span>
        )}
      </div>

      <div className={`${className}__bars`}>
        {buckets.map((bucket) => {
          const modifierClassName = getRowModifierClassName?.(bucket.key);
          const isActive = activeKey === bucket.key;

          return (
            <button
              key={bucket.key}
              type="button"
              className={`${className}__row${
                modifierClassName ? ` ${modifierClassName}` : ''
              }${isActive ? ' is-active' : ''}`}
              onClick={() => onToggle(bucket.key)}
              aria-pressed={isActive}
            >
              <span className={`${className}__label`}>
                {bucket.label}
              </span>
              <span className={`${className}__track`}>
                <span
                  className={`${className}__fill`}
                  style={{
                    width: `${(bucket.count / maxCount) * 100}%`,
                  }}
                />
              </span>
              <strong>{formatPortfolioInteger(bucket.count)}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PortfolioPromiseDistribution;
