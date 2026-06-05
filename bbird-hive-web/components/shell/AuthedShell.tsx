"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { TopNav } from "./TopNav";
import { ToastHost } from "./Toast";
import { useCurrentUser } from "./useCurrentUser";
import { isAdmin } from "../../lib/api/guards";

interface AuthedShellProps {
  children: ReactNode;
  fallbackTitle?: string;
  requireAdmin?: boolean;
  denyRedirect?: string;
}

export function AuthedShell({
  children,
  fallbackTitle,
  requireAdmin = false,
  denyRedirect = "/console"
}: AuthedShellProps) {
  const router = useRouter();
  const { user, error } = useCurrentUser();

  useEffect(() => {
    if (error && typeof window !== "undefined") {
      router.replace("/login");
    }
  }, [error, router]);

  if (error) {
    return null;
  }

  if (!user) {
    return (
      <>
        <TopNavSkeleton title={fallbackTitle ?? "加载中"} />
        <main className="main">
          <p className="login-sub">正在加载账号…</p>
        </main>
      </>
    );
  }

  if (requireAdmin && !isAdmin(user)) {
    return (
      <>
        <TopNav user={user} />
        <div className="authed-shell">
          <main className="main">
            <section className="panel" style={{ maxWidth: 480, margin: "40px auto" }}>
              <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>需要管理员权限</h1>
              <p className="login-sub" style={{ marginTop: 8 }}>
                当前账号为普通用户，无权访问管理端。
              </p>
              <p className="form-hint form-hint-err" style={{ marginTop: 12 }} role="status">
                访问被拒绝 · 事件已记录
              </p>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => router.push(denyRedirect)}>
                  返回工作台
                </button>
              </div>
            </section>
          </main>
        </div>
        <ToastHost />
      </>
    );
  }

  return (
    <>
      <TopNav user={user} />
      <div className="authed-shell">
        <main className="main">{children}</main>
      </div>
      <ToastHost />
    </>
  );
}

function TopNavSkeleton({ title }: { title: string }) {
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <div className="brand">
          <span className="brand-mark">⌬</span>
          <span>Agent Console</span>
        </div>
        <span className="spacer" />
        <span className="login-hint">{title}</span>
      </div>
    </header>
  );
}
