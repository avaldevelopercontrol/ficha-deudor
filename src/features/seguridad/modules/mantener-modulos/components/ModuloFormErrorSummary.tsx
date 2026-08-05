import type React from 'react';

interface ModuloFormErrorSummaryProps {
  errors:
    Record<string, string>;

  title:
    string;
}

export const ModuloFormErrorSummary:
  React.FC<
    ModuloFormErrorSummaryProps
  > = ({
    errors,
    title,
  }) => {
    const errorEntries =
      Object.entries(errors);

    if (
      errorEntries.length === 0
    ) {
      return null;
    }

    return (
      <div
        className="error-summary"
        role="alert"
      >
        <strong>
          {title}
        </strong>

        <ul>
          {errorEntries.map(
            ([
              field,
              message,
            ]) => (
              <li key={field}>
                {message}
              </li>
            )
          )}
        </ul>
      </div>
    );
  };

export default ModuloFormErrorSummary;
