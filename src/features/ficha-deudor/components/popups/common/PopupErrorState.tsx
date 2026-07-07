import React from 'react';

interface PopupErrorStateProps {
  title: string;
  message: string;
  retryLabel: string;
  closeLabel: string;
  onRetry: () => void;
  onClose: () => void;
}

export const PopupErrorState: React.FC<PopupErrorStateProps> = ({
  title,
  message,
  retryLabel,
  closeLabel,
  onRetry,
  onClose,
}) => {
  return (
    <div className="popup-error">
      <div className="popup-error-icon">⚠</div>

      <h4>{title}</h4>

      <p>{message}</p>

      <div className="popup-error-actions">
        <button className="btn btn-primary" onClick={onRetry}>
          {retryLabel}
        </button>

        <button className="btn btn-secondary" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
};