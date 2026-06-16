export const Role = {
  ADMIN: "ADMIN",
  MASTER: "MASTER",
  GUEST: "GUEST",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_DASHBOARDS: Record<Role, string> = {
  ADMIN: "/admin",
  MASTER: "/master",
  GUEST: "/guest",
};

export const PROTECTED_ROUTES: Record<string, Role> = {
  "/admin": Role.ADMIN,
  "/master": Role.MASTER,
  "/guest": Role.GUEST,
};

export const PUBLIC_AUTH_PATHS = ["/login", "/signup", "/apply"];

export function getRoleFromUser(
  user: { app_metadata?: Record<string, unknown> } | null
): Role | null {
  const raw = user?.app_metadata?.role;
  if (typeof raw === "string" && raw.toUpperCase() in Role) {
    return raw.toUpperCase() as Role;
  }
  return null;
}

export function getRequiredRole(pathname: string): Role | null {
  const matched = Object.keys(PROTECTED_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );
  return matched ? (PROTECTED_ROUTES[matched] ?? null) : null;
}
