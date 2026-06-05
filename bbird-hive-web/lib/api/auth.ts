import { apiRequest } from "./client";
import type { LoginResponse, UserSummary } from "./session";

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function logout() {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}

export function currentUser() {
  return apiRequest<UserSummary>("/auth/me");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<void>("/auth/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

export function createUser(username: string, role: "USER" | "ADMIN", status: "ACTIVE" | "DISABLED") {
  return apiRequest<{ user: UserSummary; initialPassword: string }>("/admin/users", {
    method: "POST",
    body: JSON.stringify({ username, role, status })
  });
}

export function listUsers() {
  return apiRequest<UserListItem[]>("/admin/users");
}

export function updateUserStatus(userId: string, status: "ACTIVE" | "DISABLED") {
  return apiRequest<void>(`/admin/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
}

export function resetPassword(userId: string) {
  return apiRequest<{ initialPassword: string }>(`/admin/users/${userId}/password-reset`, {
    method: "POST" });
}

export interface UserListItem {
  id: string;
  username: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  createdByAdminId: string;
  createdAt: string;
  lastLoginAt: string | null;
}
