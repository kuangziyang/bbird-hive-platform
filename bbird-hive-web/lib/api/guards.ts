import type { UserSummary } from "./session";

export function isAdmin(user: UserSummary | null | undefined) {
  return user?.role === "ADMIN";
}
