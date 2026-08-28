import {
  matchPath,
} from 'react-router-dom';

export const matchesWithoutSidebarPath = (
  pathname: string,
  routePatterns: readonly string[]
): boolean =>
  routePatterns.some((routePattern) =>
    Boolean(
      matchPath(
        {
          path: routePattern,
          end: true,
        },
        pathname
      )
    )
  );
