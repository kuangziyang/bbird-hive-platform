"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { UserSummary } from "../../lib/api/session";
import { logout as apiLogout } from "../../lib/api/auth";
import { IconUser, IconKey, IconLogout } from "./Icon";

interface ProfileMenuProps {
  user: UserSummary;
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const router = useRouter();
  const isAdmin = user.role === "ADMIN";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="profile-menu" ref={containerRef}>
      <button
        type="button"
        className="profile-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="账号菜单"
      >
        <span className="avatar">{user.username.slice(0, 2).toUpperCase()}</span>
        <span className="profile-meta">
          <span className="name">{user.username}</span>
          <span className="role">{isAdmin ? "ADMIN" : "USER"}</span>
        </span>
      </button>
      {open ? (
        <div className="menu" role="menu" aria-label="账号菜单">
          <div className="menu-head">
            <span className="menu-head-name">{user.username}</span>
            <span className="menu-head-role">{isAdmin ? "管理员" : "普通用户"}</span>
          </div>
          <Link
            href="/account"
            className="menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <IconUser size={13} />
            <span>个人设置</span>
          </Link>
          <Link
            href="/account/password"
            className="menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <IconKey size={13} />
            <span>修改密码</span>
          </Link>
          <div className="menu-sep" />
          <button
            type="button"
            className="menu-item menu-danger"
            role="menuitem"
            onClick={handleLogout}
          >
            <IconLogout size={13} />
            <span>退出登录</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
