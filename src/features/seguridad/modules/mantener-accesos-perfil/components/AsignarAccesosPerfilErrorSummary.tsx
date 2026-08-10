import type {
  ReactNode,
} from 'react';

interface AsignarAccesosPerfilErrorSummaryProps {
  errors: Record<string, string>;
  title: string;
}

export const AsignarAccesosPerfilErrorSummary = ({
  errors,
  title,
}: AsignarAccesosPerfilErrorSummaryProps): ReactNode => {
  const errorEntries =
    Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div
      className="error-summary"
      role="alert"
    >
      <strong>{title}</strong>

      <ul>
        {errorEntries.map(
          ([field, message]) => (
            <li key={field}>
              {message}
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default AsignarAccesosPerfilErrorSummary;
