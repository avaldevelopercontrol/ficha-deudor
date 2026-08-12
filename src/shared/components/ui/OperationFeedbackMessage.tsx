import React from 'react';

import type {
  OperationFeedback,
} from '../../feedback/operationFeedback';

import {
  FeedbackMessage,
} from './FeedbackMessage';

interface OperationFeedbackMessageProps {
  feedback: OperationFeedback | null;
  onClose: () => void;
}

export const OperationFeedbackMessage: React.FC<
  OperationFeedbackMessageProps
> = ({
  feedback,
  onClose,
}) => {
  if (!feedback) {
    return null;
  }

  return (
    <FeedbackMessage
      variant={feedback.variant}
      title={feedback.title}
      message={feedback.message}
      onClose={onClose}
    />
  );
};
