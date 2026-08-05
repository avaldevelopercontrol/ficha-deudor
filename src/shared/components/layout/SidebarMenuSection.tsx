import type React from 'react';

import {
  NavLink,
} from 'react-router-dom';

interface SidebarSubItem {
  label: string;
  to: string;
  disabled?: boolean;
}

interface SidebarMenuSectionProps {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  items: SidebarSubItem[];
  to?: string;
  disabled?: boolean;
  onToggle: () => void;
}

const NO_CONSULT_PERMISSION_TITLE =
  'Sin permiso de consulta';

const ChevronIcon = ({
  isOpen,
}: {
  isOpen: boolean;
}) => (
  <svg
    className={
      isOpen
        ? 'app-sidebar__arrow app-sidebar__arrow--open'
        : 'app-sidebar__arrow'
    }
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M6 9l6 6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NavigationContent = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <>
    <span className="app-sidebar__nav-icon">
      {icon}
    </span>

    <span className="app-sidebar__nav-text">
      {label}
    </span>
  </>
);

export const SidebarMenuSection: React.FC<
  SidebarMenuSectionProps
> = ({
  label,
  icon,
  isOpen,
  items,
  to,
  disabled = false,
  onToggle,
}) => {
  if (
    items.length === 0 &&
    to
  ) {
    if (disabled) {
      return (
        <button
          type="button"
          className="app-sidebar__nav-item app-sidebar__nav-item--disabled"
          disabled
          aria-disabled="true"
          title={
            NO_CONSULT_PERMISSION_TITLE
          }
        >
          <NavigationContent
            icon={icon}
            label={label}
          />
        </button>
      );
    }

    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            'app-sidebar__nav-item',
            isActive
              ? 'app-sidebar__nav-item--active'
              : '',
          ].join(' ')
        }
      >
        <NavigationContent
          icon={icon}
          label={label}
        />
      </NavLink>
    );
  }

  return (
    <div className="app-sidebar__nav-section">
      <button
        type="button"
        className={[
          'app-sidebar__nav-item',
          'app-sidebar__nav-item--parent',
          disabled
            ? 'app-sidebar__nav-item--disabled'
            : '',
          !disabled && isOpen
            ? 'app-sidebar__nav-item--active'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onToggle}
        aria-expanded={
          disabled
            ? false
            : isOpen
        }
        aria-disabled={disabled}
        disabled={disabled}
        title={
          disabled
            ? NO_CONSULT_PERMISSION_TITLE
            : undefined
        }
      >
        <NavigationContent
          icon={icon}
          label={label}
        />

        <ChevronIcon
          isOpen={
            !disabled &&
            isOpen
          }
        />
      </button>

      {!disabled &&
        isOpen && (
          <div className="app-sidebar__submenu">
            {items.map((item) =>
              item.disabled ? (
                <span
                  key={item.to}
                  className="app-sidebar__sub-item app-sidebar__sub-item--disabled"
                  aria-disabled="true"
                  title={
                    NO_CONSULT_PERMISSION_TITLE
                  }
                >
                  {item.label}
                </span>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({
                    isActive,
                  }) =>
                    [
                      'app-sidebar__sub-item',
                      isActive
                        ? 'app-sidebar__sub-item--active'
                        : '',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>
        )}
    </div>
  );
};

export default SidebarMenuSection;
