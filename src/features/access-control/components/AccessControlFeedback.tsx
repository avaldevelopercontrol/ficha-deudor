import type React from 'react';

interface AccessControlFeedbackProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AccessControlFeedback: React.FC<
  AccessControlFeedbackProps
> = ({
  message,
  actionLabel,
  onAction,
}) => (
  <section
    className="access-control-feedback"
    role="status"
  >
    <p>{message}</p>

    {actionLabel && onAction && (
      <button
        type="button"
        className="btn btn-primary"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    )}
  </section>
);
