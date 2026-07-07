import React from 'react';

interface PopupLoadingStateProps {
  message: string;
}

export const PopupLoadingState: React.FC<PopupLoadingStateProps> = ({
  message,
}) => {
  return (
    <div className="popup-loading">
      <div className="popup-loading-spinner" />
      <p>{message}</p>
    </div>
  );
};