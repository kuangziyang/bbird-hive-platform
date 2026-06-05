"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserSummary } from "../../lib/api/session";
import {
  IconHome,
  IconBot,
  IconInbox,
  IconChat,
  IconServer,
  IconBook,
  IconBox,
  IconShield,
  IconUsers,
  IconActivity,
  IconSettings,
} from "./Icon";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const USER_NAV: NavItem[] = [
  { href: "/console", label: "工作台", icon: IconHome },
  { href: "/console?tab=agents", label: "我的智能体", icon: IconBot },
  { href: "/console?tab=requests", label: "我的需求", icon: IconInbox },
  { href: "/console?tab=chats", label: "会话与群聊", icon: IconChat },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/console", label: "管理概览", icon: IconShield },
  { href: "/console?tab=admin-agents", label: "全部智能体", icon: IconBot },
  { href: "/admin/users", label: "账号管理", icon: IconUsers },
  { href: "/console/mcp-servers", label: "MCP 服务器", icon: IconServer },
  { href: "/console?tab=skills", label: "技能库", icon: IconBook },
  { href: "/console?tab=sandbox", label: "沙箱镜像", icon: IconBox },
  { href: "/console?tab=access-events", label: "访问事件", icon: IconActivity },
  { href: "/console?tab=settings", label: "平台设置", icon: IconSettings },
];

interface SidebarProps {
  user: UserSummary;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";

  function isActive(href: string) {
    if (href === "/console") {
      return pathname === "/console";
    }
    if (href.startsWith("/console/")) {
      return pathname.startsWith(href);
    }
    return false;
  }

  return (
    <aside className="sidebar" aria-label="主导航">
      <div className="nav-group" data-nav-for="user" style={{ display: isAdmin ? "none" : "block" }}>
        <div className="nav-group-title">工作台</div>
        {USER_NAV.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`nav-item${isActive(it.href) ? " is-active" : ""}`}
            >
              <Icon size={15} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="nav-group" data-nav-for="admin" style={{ display: isAdmin ? "block" : "none" }}>
        <div className="nav-group-title">管理</div>
        {ADMIN_NAV.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`nav-item${isActive(it.href) ? " is-active" : ""}`}
            >
              <Icon size={15} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
