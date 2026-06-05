"use client";

import Link from "next/link";
import { AuthedShell } from "../../components/shell/AuthedShell";
import { PageHeader } from "../../components/shell/PageHeader";
import { useCurrentUser } from "../../components/shell/useCurrentUser";
import { IconKey, IconUser, IconShield } from "../../components/shell/Icon";

export default function AccountPage() {
  const { user, error } = useCurrentUser();

  return (
    <AuthedShell fallbackTitle="个人工作空间">
      <PageHeader
        title="个人工作空间"
        sub="账号信息、密码维护与进入工作台。"
        backHref="/console"
        backLabel="返回工作台"
      />

      {error ? (
        <p className="form-hint form-hint-err" role="status">
          加载账号信息失败：{error}
        </p>
      ) : null}

      <div className="entry-grid" style={{ marginBottom: 20 }}>
        <Link href="/account/password" className="entry-card">
          <span className="entry-icon">
            <IconKey size={15} />
          </span>
          <div className="entry-stack">
            <span className="entry-title">修改密码</span>
            <span className="entry-sub">登录后随时更换自己的密码，旧密码立即失效。</span>
          </div>
        </Link>
      </div>

      <section className="panel" style={{ maxWidth: 520 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>账号信息</h2>
        {user ? (
          <dl className="kv">
            <dt className="k">用户名</dt>
            <dd className="v" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconUser size={13} /> {user.username}
            </dd>
            <dt className="k">平台角色</dt>
            <dd className="v" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user.role === "ADMIN" ? <IconShield size={13} /> : <IconUser size={13} />}
              {user.role === "ADMIN" ? "管理员" : "普通用户"}
            </dd>
            <dt className="k">账号状态</dt>
            <dd className="v">{user.status === "ACTIVE" ? "启用" : "停用"}</dd>
          </dl>
        ) : (
          <p className="login-sub">正在加载账号信息…</p>
        )}
      </section>
    </AuthedShell>
  );
}
