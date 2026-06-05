"use client";

import Link from "next/link";
import { AuthedShell } from "../../components/shell/AuthedShell";
import { PageHeader } from "../../components/shell/PageHeader";
import { IconUsers, IconActivity, IconShield, IconPlus } from "../../components/shell/Icon";

const ENTRIES = [
  {
    href: "/admin/users",
    title: "账号管理",
    sub: "查看、新建、重置密码、启用或停用平台账号。",
    icon: IconUsers
  },
  {
    href: "/admin/users/new",
    title: "新建账号",
    sub: "为受邀用户建立普通用户或管理员账号，生成初始密码。",
    icon: IconPlus
  },
  {
    href: "/admin/access-events",
    title: "访问事件",
    sub: "查看登录、退出、登录失败、角色变更与权限拒绝事件。",
    icon: IconActivity
  }
];

export default function AdminPage() {
  return (
    <AuthedShell requireAdmin fallbackTitle="管理端">
      <PageHeader
        title="管理端"
        sub="账号、访问事件与平台级资源入口。所有管理操作都会被审计。"
        backHref="/console"
        backLabel="返回工作台"
      />

      <section className="panel" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span className="badge badge-ok">
            <IconShield size={11} />&nbsp;ADMIN
          </span>
          <span style={{ fontSize: 13.5 }}>仅管理员可访问本目录下的功能。</span>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
          普通用户访问本页时会被拒绝并产生一条访问事件，便于追溯。
        </p>
      </section>

      <div className="entry-grid">
        {ENTRIES.map((entry) => {
          const Icon = entry.icon;
          return (
            <Link key={entry.href} href={entry.href} className="entry-card">
              <span className="entry-icon">
                <Icon size={15} />
              </span>
              <div className="entry-stack">
                <span className="entry-title">{entry.title}</span>
                <span className="entry-sub">{entry.sub}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </AuthedShell>
  );
}
