"use client";

import { useMemo, useState } from "react";
import type { Agent } from "../../lib/console/mock";
import { IconPencil, IconBolt, IconChat, IconTrash } from "./Icon";
import { toast } from "./Toast";

interface AgentTableProps {
  agents: Agent[];
  showOwner?: boolean;
  onTogglePause?: (id: string) => void;
}

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "active", label: "运行中" },
  { key: "draft", label: "草稿" },
  { key: "paused", label: "已暂停" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function statusBadge(status: Agent["status"]) {
  if (status === "active") return <span className="badge badge-ok"><span className="dot" />运行中</span>;
  if (status === "draft") return <span className="badge">草稿</span>;
  return <span className="badge badge-warn">已暂停</span>;
}

export function AgentTable({ agents, showOwner, onTogglePause }: AgentTableProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return agents.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (q && !`${a.name} ${a.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [agents, filter, q]);

  return (
    <div>
      <div className="filters">
        <div className="filter-group" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              className="filter-pill"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="filter-search">
          <input
            type="search"
            placeholder="按名称或描述筛选…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>智能体</th>
            <th>状态</th>
            {showOwner ? <th>归属</th> : null}
            <th>MCP / 技能</th>
            <th className="num">调用次数</th>
            <th>最近使用</th>
            <th style={{ textAlign: "right" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showOwner ? 7 : 6} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                暂无符合条件的智能体
              </td>
            </tr>
          ) : null}
          {rows.map((a) => (
            <tr key={a.id}>
              <td>
                <div className="name-cell">
                  <span className="avatar">{a.mark}</span>
                  <span className="stack">
                    <span className="title">{a.name}</span>
                    <span className="meta">{a.description}</span>
                  </span>
                </div>
              </td>
              <td>{statusBadge(a.status)}</td>
              {showOwner ? (
                <td>
                  <span className="badge">{a.owner === "me" ? "我创建" : "团队"}</span>
                </td>
              ) : null}
              <td>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {a.mcps.map((m) => (
                    <span key={m} className="badge">{m}</span>
                  ))}
                  <span className="badge">{a.skills} 技能</span>
                </div>
              </td>
              <td className="num">{a.calls.toLocaleString()}</td>
              <td style={{ color: "var(--muted)" }}>{a.lastUsed}</td>
              <td>
                <div className="row-actions">
                  <button className="btn btn-ghost" type="button" title="编辑" onClick={() => toast(`编辑「${a.name}」`)}>
                    <IconPencil size={14} />
                  </button>
                  <button className="btn btn-ghost" type="button" title="运行" onClick={() => toast(`已对「${a.name}」发起运行`)}>
                    <IconBolt size={14} />
                  </button>
                  <button className="btn btn-ghost" type="button" title="打开会话" onClick={() => toast(`打开「${a.name}」的会话`)}>
                    <IconChat size={14} />
                  </button>
                  {onTogglePause ? (
                    <button
                      className="switch"
                      type="button"
                      role="switch"
                      aria-checked={a.status !== "paused"}
                      onClick={() => onTogglePause(a.id)}
                      title={a.status === "paused" ? "恢复" : "暂停"}
                    />
                  ) : null}
                  <button className="btn btn-ghost" type="button" title="删除" onClick={() => toast(`已删除「${a.name}」（演示）`)}>
                    <IconTrash size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
