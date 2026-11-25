export const DASHBOARD_PATH = "/dashboard";

export const PUBLIC_API_PATHS = [
  "/api/widget/config",
  "/api/widget/chat",
  "/api/posthog-config",
  "/api/clerk/webhook",
] as const;

export function matchesPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((path) => matchesPath(pathname, path));
}

export interface ProtectedRouteMatch {
  dashboard: boolean;
  ownerApi: boolean;
}

export function matchProtectedRoute(pathname: string): ProtectedRouteMatch {
  return {
    dashboard: matchesPath(pathname, DASHBOARD_PATH),
    ownerApi: pathname.startsWith("/api/") && !isPublicApi(pathname),
  };
}
