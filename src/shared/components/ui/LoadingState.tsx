import '../../styles/components/loading-state.css';

interface LoadingStateProps {
  message: string;
  className?: string;
}

export const LoadingState = ({
  message,
  className = '',
}: LoadingStateProps) => (
  <div
    className={`loading-state ${className}`.trim()}
    role="status"
    aria-live="polite"
  >
    <span className="loading-state__spinner" aria-hidden="true" />
    <span>{message}</span>
  </div>
);
