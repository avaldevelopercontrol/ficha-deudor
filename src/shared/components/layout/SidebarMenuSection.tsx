import type React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarSubItem {
  label: string;
  to: string;
}

interface SidebarMenuSectionProps {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  items: SidebarSubItem[];
  onToggle: () => void;
}

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
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

export const SidebarMenuSection: React.FC<
  SidebarMenuSectionProps
> = ({
  label,
  icon,
  isOpen,
  items,
  onToggle,
}) => {
  return (
    <div className="app-sidebar__nav-section">
      <button
        type="button"
        className={[
          'app-sidebar__nav-item',
          'app-sidebar__nav-item--parent',
          isOpen ? 'app-sidebar__nav-item--active' : '',
        ].join(' ')}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="app-sidebar__nav-icon">
          {icon}
        </span>

        <span className="app-sidebar__nav-text">
          {label}
        </span>

        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="app-sidebar__submenu">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarMenuSection;