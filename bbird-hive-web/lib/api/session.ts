export type PlatformRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "DISABLED";

export interface UserSummary {
  id: string;
  username: string;
  role: PlatformRole;
  status: UserStatus;
}

export interface LoginResponse {
  user: UserSummary;
  sessionExpiresAt: string;
}
