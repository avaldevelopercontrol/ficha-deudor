import type { FC } from 'react';

import { ActionButton } from '@shared/components/ui/ActionButton';

type FichaDeudorPageStateVariant =
  | 'loading'
  | 'error';

interface Props {
  variant: FichaDeudorPageStateVariant;
  message: string;
  onRetry?: () => void;
}

const FichaDeudorPageState: FC<Props> = ({
  variant,
  message,
  onRetry,
}) => {
  const isError = variant === 'error';

  return (
    <div className="ficha-page">
      <main className="ficha-main">
        <section
          className="ficha-card panel-colapsable"
          aria-busy={!isError}
        >
          <div className="panel-colapsable-header">
            <span className="panel-colapsable-title">
              Ficha del deudor
            </span>
          </div>

          <div className="panel-colapsable-body">
            <div
              role={isError ? 'alert' : 'status'}
              aria-live="polite"
              style={{
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: isError
                    ? '#c00'
                    : '#666',
                }}
              >
                {message}
              </p>

              {isError && onRetry && (
                <div
                  style={{
                    marginTop: '16px',
                  }}
                >
                  <ActionButton
                    label="Reintentar"
                    variant="primary"
                    size="sm"
                    onClick={onRetry}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FichaDeudorPageState;