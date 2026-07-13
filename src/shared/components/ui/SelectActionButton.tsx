import type React from 'react';

interface SelectActionButtonProps {
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const SelectActionIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

    <circle
      cx="9"
      cy="7"
      r="4"
    />

    <path d="m16 11 2 2 4-4" />
  </svg>
);

export const SelectActionButton: React.FC<
  SelectActionButtonProps
> = ({
  ariaLabel,
  title = ariaLabel,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="select-action-button"
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      <SelectActionIcon />
    </button>
  );
};

export default SelectActionButton;