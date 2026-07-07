import React from 'react';

interface ModalErrorSummaryProps {
  errors: Record<string, string | undefined | null>;
  title: string;
}

export const ModalErrorSummary: React.FC<ModalErrorSummaryProps> = ({
  errors,
  title,
}) => {
  const errorMessages = Object.values(errors).filter(
    (error): error is string => Boolean(error)
  );

  if (errorMessages.length === 0) return null;

  return (
    <div className="error-summary">
      <strong>{title}</strong>

      <ul>
        {errorMessages.map((error, index) => (
          <li key={`${error}-${index}`}>{error}</li>
        ))}
      </ul>
    </div>
  );
};