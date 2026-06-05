"use client";

import { useEffect, useState } from "react";
import { AuthedShell } from "../../../components/shell/AuthedShell";
import { PageHeader } from "../../../components/shell/PageHeader";
import { apiRequest } from "../../../lib/api/client";

interface AccessEvent {
  id: string;
  type: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "ROLE_CHANGED" | "ACCESS_DENIED" | "PASSWORD_CHANGED" | "PASSWORD_RESET";
  actor: string;
  target?: string;
  result: "OK" | "DENIED";
  occurredAt: string;
}

const TYPE_LABEL: Record<AccessEvent["type"], string> = {
  LOGIN: "登录",
  LOGOUT: "退出",
  LOGIN_FAILED: "登录失败",
  ROLE_CHANGED: "角色变更",
  ACCESS_DENIED: "权限拒绝",
  PASSWORD_CHANGED: "修改密码",
  PASSWORD_RESET: "重置密码"
};

export default function AccessEventsPage() {
  const [events, setEvents] = useState<AccessEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | AccessEvent["type"]>("ALL");

  useEffect(() => {
    let active = true;
    apiRequest<AccessEvent[]>("/admin/access-events")
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "加载失败");
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = (events ?? []).filter((e) => filter === "ALL" || e.type === filter);
  const filterGroups: Array<{ key: "ALL" | AccessEvent["type"]; label: string }> = [
    { key: "ALL", label: "全部" },
    { key: "LOGIN", label: "登录" },
    { key: "LOGIN_FAILED", label: "失败" },
    { key: "ACCESS_DENIED", label: "拒绝" },
    { key: "ROLE_CHANGED", label: "角色" },
    { key: "PASSWORD_CHANGED", label: "改密" }
  ];

  return (
    <AuthedShell requireAdmin fallbackTitle="访问事件">
      <PageHeader
        title="访问事件"
        sub="登录、退出、登录失败、角色变更、权限拒绝和密码相关事件的审计记录。"
        backHref="/admin"
        backLabel="返回管理端"
      />

      <div className="filters">
        <div className="filter-group" role="tablist" aria-label="事件类型">
          {filterGroups.map((g) => (
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
        <span className="filter-meta">
          {events ? `${visible.length} / ${events.length} 条` : "加载中…"}
        </span>
      </div>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table" aria-label="访问事件">
          <thead>
            <tr>
              <th>时间</th>
              <th>类型</th>
              <th>操作者</th>
              <th>目标</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={5} style={{ color: "var(--danger)", textAlign: "center", padding: 24 }}>
                  加载失败：{error}
                </td>
              </tr>
            ) : !events ? (
              <tr>
                <td colSpan={5} style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>
                  正在加载事件…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>
                  当前筛选下没有事件。
                </td>
              </tr>
            ) : (
              visible.map((e) => (
                <tr key={e.id}>
                  <td className="num">{formatTime(e.occurredAt)}</td>
                  <td>{TYPE_LABEL[e.type]}</td>
                  <td>{e.actor}</td>
                  <td style={{ color: "var(--muted)" }}>{e.target ?? "—"}</td>
                  <td>
                    <span className={`badge ${e.result === "OK" ? "badge-ok" : "badge-danger"}`}>
                      <span className="dot" />&nbsp;{e.result}
                    </span>
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

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
