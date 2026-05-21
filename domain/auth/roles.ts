export const ROLE_ADMIN = "ADMIN" as const;
export const ROLE_JUDGE = "JUDGE" as const;
export const ROLE_VIEWER = "VIEWER" as const;

export type AuthRole = typeof ROLE_ADMIN | typeof ROLE_JUDGE | typeof ROLE_VIEWER;

export const rolePermissions: Record<AuthRole, string[]> = {
  ADMIN: ["*"] ,
  JUDGE: ["challenge.view", "dish.score", "ranking.view"],
  VIEWER: ["ranking.view", "content.view"],
};
