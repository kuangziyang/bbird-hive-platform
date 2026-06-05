"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserSummary } from "../../lib/api/session";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { ToastHost } from "./Toast";

interface ConsoleShellProps {
  user: UserSummary;
  children: React.ReactNode;
}

export function ConsoleShell({ user, children }: ConsoleShellProps) {
  const router = useRouter();

  useEffect(() => {
    // ensure fresh session on entry
  }, []);

  return (
    <>
      <TopNav user={user} />
      <div className="shell">
        <Sidebar user={user} />
        <main className="main">{children}</main>
      </div>
      <ToastHost />
    </>
  );
}

export function useRequireUser() {
  const router = useRouter();
  return (user: UserSummary | null): user is UserSummary => {
    if (!user) {
      router.replace("/login");
      return false;
    }
    return true;
  };
}
