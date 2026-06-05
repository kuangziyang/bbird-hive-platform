"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AuthedShell } from "../../../components/shell/AuthedShell";
import { PageHeader } from "../../../components/shell/PageHeader";
import { IconUser, IconShield, IconPlus, IconCheck, IconX } from "../../../components/shell/Icon";
import { listUsers, updateUserStatus, type UserListItem } from "../../../lib/api/auth";
import { ResetPasswordButton } from "../../../components/auth/ResetPasswordButton";

type Filter = "ALL" | "USER" | "ADMIN";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRelative(iso: string | null | undefined) {
  if (!iso) return "从未登录";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return `${Math.floor(diff / 86_400_000)} 天前`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleStatus(userId: string, currentStatus: "ACTIVE" | "DISABLED") {
    const next = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    setBusy(userId);
    try {
      await updateUserStatus(userId, next);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setBusy(null);
    }
  }

  const visible = (users ?? []).filter((u) => filter === "ALL" || u.role === filter);
  const totalActive = (users ?? []).filter((u) => u.status === "ACTIVE").length;
  const totalAdmins = (users ?? []).filter((u) => u.role === "ADMIN").length;

  return (
    <AuthedShell requireAdmin fallbackTitle="账号管理">
      <PageHeader
        title="账号管理"
        sub="查看、新建、重置密码、启用或停用账号。普通用户不能访问。"
        backHref="/admin"
        backLabel="返回管理端"
        actions={
          <Link href="/admin/users/new" className="btn btn-primary">
            <IconPlus size={14} /> 新建账号
          </Link>
        }
      />

      <div className="stats" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="label">账号总数</div>
          <div className="value">{users?.length ?? "—"}</div>
          <div className="delta">{totalActive} 已启用</div>
        </div>
        <div className="stat">
          <div className="label">管理员</div>
          <div className="value">{totalAdmins}</div>
          <div className="delta">ADMIN</div>
        </div>
        <div className="stat">
          <div className="label">普通用户</div>
          <div className="value">{(users?.length ?? 0) - totalAdmins}</div>
          <div className="delta">USER</div>
        </div>
        <div className="stat">
          <div className="label">最近新增</div>
          <div className="value" style={{ fontSize: 18 }}>
            {users && users.length > 0 ? formatDate(users[users.length - 1].createdAt) : "—"}
          </div>
          <div className="delta">{users && users.length > 0 ? users[users.length - 1].username : "—"}</div>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group" role="tablist" aria-label="角色">
          {[
            { key: "ALL" as const, label: "全部" },
            { key: "USER" as const, label: "普通用户" },
            { key: "ADMIN" as const, label: "管理员" }
          ].map((g) => (
            <button
              key={g.key}
              type="button"
              role="tab"
              aria-pressed={filter === g.key}
              className="filter-pill"
              onClick={() => setFilter(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <button type="button" className="btn btn-ghost" onClick={refresh}>刷新</button>
      </div>

      {error ? (
        <p className="form-hint form-hint-err" role="status">加载失败：{error}</p>
      ) : null}

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table" aria-label="账号列表">
          <thead>
            <tr>
              <th>用户名</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>最近登录</th>
              <th style={{ textAlign: "right" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {!users ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>
                  正在加载账号…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>
                  {filter === "ALL" ? "还没有账号" : "当前筛选下没有账号"}
                </td>
              </tr>
            ) : (
              visible.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="name-cell">
                      <span className="avatar">{u.username.slice(0, 2).toUpperCase()}</span>
                      <div className="stack">
                        <span className="title">{u.username}</span>
                        <span className="meta">id: {u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === "ADMIN" ? "badge-ok" : ""}`}>
                      {u.role === "ADMIN" ? <IconShield size={10} /> : <IconUser size={10} />}&nbsp;{u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === "ACTIVE" ? "badge-ok" : "badge-danger"}`}>
                      <span className="dot" />&nbsp;{u.status === "ACTIVE" ? "启用" : "停用"}
                    </span>
                  </td>
                  <td className="num">{formatDate(u.createdAt)}</td>
                  <td className="num" style={{ color: "var(--muted)" }}>{formatRelative(u.lastLoginAt)}</td>
                  <td>
                    <div className="row-actions">
                      <ResetPasswordButton userId={u.id} username={u.username} />
                      <button
                        type="button"
                        className={`btn ${u.status === "ACTIVE" ? "btn-secondary" : "btn-primary"}`}
                        onClick={() => handleStatus(u.id, u.status)}
                        disabled={busy === u.id}
                        title={u.status === "ACTIVE" ? "停用此账号" : "启用此账号"}
                      >
                        {u.status === "ACTIVE" ? <><IconX size={12} /> 停用</> : <><IconCheck size={12} /> 启用</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AuthedShell>
  );
}
