import type React from 'react';

import {
  NavLink,
  useLocation,
} from 'react-router-dom';

export interface SidebarNavigationItem {
  id: number;
  label: string;
  to?: string;
  disabled?: boolean;
  children?: SidebarNavigationItem[];
}

interface SidebarMenuSectionProps {
  sectionId: number;
  label: string;
  icon: React.ReactNode;
  items: SidebarNavigationItem[];
  openSections: Readonly<Record<number, boolean>>;
  to?: string;
  disabled?: boolean;
  onToggle: (optionId: number) => void;
}

const NO_CONSULT_PERMISSION_TITLE =
  'Sin permiso de consulta';

const normalizeRoutePath = (
  path: string
) => {
  if (path === '/') {
    return path;
  }

  return path.replace(/\/+$/, '');
};

const isRouteActive = (
  pathname: string,
  to: string
) => {
  const currentPath =
    normalizeRoutePath(pathname);
  const targetPath =
    normalizeRoutePath(to);

  return (
    currentPath === targetPath ||
    (targetPath !== '/' &&
      currentPath.startsWith(
        `${targetPath}/`
      ))
  );
};

const isNavigationItemActive = (
  pathname: string,
  item: SidebarNavigationItem
): boolean =>
  !item.disabled &&
  ((item.to
    ? isRouteActive(
        pathname,
        item.to
      )
    : false) ||
    (item.children?.some(
      (child) =>
        isNavigationItemActive(
          pathname,
          child
        )
    ) ?? false));

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

interface NestedNavigationItemProps {
  item: SidebarNavigationItem;
  pathname: string;
  openSections: Readonly<Record<number, boolean>>;
  onToggle: (optionId: number) => void;
}

const NestedNavigationItem = ({
  item,
  pathname,
  openSections,
  onToggle,
}: NestedNavigationItemProps) => {
  const children =
    item.children ?? [];
  const hasChildren =
    children.length > 0;
  const isActive =
    isNavigationItemActive(
      pathname,
      item
    );
  const isOpen =
    openSections[item.id] ?? true;

  if (hasChildren) {
    return (
      <div className="app-sidebar__sub-section">
        <button
          type="button"
          className={[
            'app-sidebar__sub-item',
            'app-sidebar__sub-item--parent',
            item.disabled
              ? 'app-sidebar__sub-item--disabled'
              : '',
            isActive
              ? 'app-sidebar__sub-item--active'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => {
            onToggle(item.id);
          }}
          disabled={item.disabled}
          aria-disabled={
            item.disabled
          }
          aria-expanded={
            item.disabled
              ? false
              : isOpen
          }
          title={
            item.disabled
              ? NO_CONSULT_PERMISSION_TITLE
              : undefined
          }
        >
          <span className="app-sidebar__sub-item-text">
            {item.label}
          </span>

          <ChevronIcon
            isOpen={
              !item.disabled &&
              isOpen
            }
          />
        </button>

        {!item.disabled &&
          isOpen && (
            <div className="app-sidebar__submenu app-sidebar__submenu--nested">
              {children.map(
                (child) => (
                  <NestedNavigationItem
                    key={child.id}
                    item={child}
                    pathname={
                      pathname
                    }
                    openSections={
                      openSections
                    }
                    onToggle={
                      onToggle
                    }
                  />
                )
              )}
            </div>
          )}
      </div>
    );
  }

  if (!item.to || item.disabled) {
    return (
      <span
        className="app-sidebar__sub-item app-sidebar__sub-item--disabled"
        aria-disabled="true"
        title={
          NO_CONSULT_PERMISSION_TITLE
        }
      >
        {item.label}
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={() =>
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
  );
};

export const SidebarMenuSection: React.FC<
  SidebarMenuSectionProps
> = ({
  sectionId,
  label,
  icon,
  items,
  openSections,
  to,
  disabled = false,
  onToggle,
}) => {
  const { pathname } = useLocation();

  const isOpen =
    openSections[sectionId] ?? true;

  const isSectionActive =
    !disabled &&
    ((to
      ? isRouteActive(
          pathname,
          to
        )
      : false) ||
      items.some(
        (item) =>
          isNavigationItemActive(
            pathname,
            item
          )
      ));

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
          isSectionActive
            ? 'app-sidebar__nav-item--active'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => {
          onToggle(sectionId);
        }}
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
            {items.map(
              (item) => (
                <NestedNavigationItem
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  openSections={
                    openSections
                  }
                  onToggle={onToggle}
                />
              )
            )}
          </div>
        )}
    </div>
  );
};

export default SidebarMenuSection;
