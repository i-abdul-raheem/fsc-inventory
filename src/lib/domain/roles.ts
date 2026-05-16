/** Application roles persisted on User.role */
export const USER_ROLE = {
  ADMIN: "ADMIN",
  OPERATOR: "OPERATOR",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export function userIsAdmin(role: string): boolean {
  return role === USER_ROLE.ADMIN;
}
