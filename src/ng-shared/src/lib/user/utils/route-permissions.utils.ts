import { SideNavigationRoute } from '../../shared/types';

function hasPermFunc(route: SideNavigationRoute, permissions: string[]): boolean {
  if (route.data.access) {
    return !!permissions.find(p => p === route.data.access);
  }
  return true;
}

export function hasPermissionForRoute(
  route: SideNavigationRoute,
  allRoutes: SideNavigationRoute[],
  permissions: string[]
): boolean {
  let hasPerm = hasPermFunc(route, permissions);

  // check parent perm
  if (route.data.parent) {
    const parentRoute = allRoutes.find(r => r.path === route.data.parent);
    hasPerm = hasPerm && hasPermFunc(parentRoute, permissions);
  }

  return hasPerm;
}
