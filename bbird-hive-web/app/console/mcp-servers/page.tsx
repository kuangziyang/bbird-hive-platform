"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "../../../components/shell/useCurrentUser";
import { ConsoleShell } from "../../../components/shell/ConsoleShell";
import { PageHeader } from "../../../components/shell/PageHeader";
import { MCP_SERVERS, type McpServer, type AgentTransport } from "../../../lib/console/mock";
import { IconPlus, IconUpload, IconChevronLeft, IconPencil, IconBolt, IconTrash, IconX, IconChevronRight, IconCheck } from "../../../components/shell/Icon";
import { toast } from "../../../components/shell/Toast";

const TRANSPORT_PILLS: { key: "all" | AgentTransport; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "http", label: "HTTP" },
  { key: "stdio", label: "STDIO" },
  { key: "websocket", label: "WebSocket" },
];

function StatusBadge({ status }: { status: McpServer["status"] }) {
  if (status === "online") return <span className="badge badge-ok"><span className="dot" />在线</span>;
  if (status === "degraded") return <span className="badge badge-warn">降级</span>;
  return <span className="badge badge-danger">离线</span>;
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta ? <div className="delta">{delta}</div> : null}
    </div>
  );
}

export default function McpServersPage() {
  const { user, error } = useCurrentUser();
  const [servers, setServers] = useState<McpServer[]>(MCP_SERVERS);
  const [filter, setFilter] = useState<"all" | AgentTransport>("all");
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<McpServer | null>(null);

  const rows = useMemo(() => {
    return servers.filter((s) => {
      if (filter !== "all" && s.transport !== filter) return false;
      if (q && !`${s.name} ${s.endpoint}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [servers, filter, q]);

  if (error) return null;
  if (!user) {
    return <main className="login-page"><p className="login-sub">正在加载账号…</p></main>;
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(s: McpServer) {
    setEditing(s);
    setModalOpen(true);
  }

  function handleDelete(s: McpServer) {
    if (typeof window === "undefined") return;
    if (window.confirm(`删除 MCP 服务器「${s.name}」？将断开 ${s.refs} 个智能体的连接。`)) {
      setServers((cur) => cur.filter((x) => x.id !== s.id));
      toast("已删除");
    }
  }

  function handleTest(s: McpServer) {
    const lat = Math.round(80 + Math.random() * 220);
    setServers((cur) => cur.map((x) => (x.id === s.id ? { ...x, latency: lat, status: lat > 0 ? "online" : x.status } : x)));
    toast(`${s.name}: ${lat}ms · 健康`);
  }

  const online = servers.filter((s) => s.status === "online").length;
  const avgLatency = Math.round(
    servers.filter((s) => s.latency > 0).reduce((sum, s) => sum + s.latency, 0) /
      Math.max(1, servers.filter((s) => s.latency > 0).length)
  );
  const totalRefs = servers.reduce((sum, s) => sum + s.refs, 0);

  return (
    <ConsoleShell user={user}>
      <PageHeader
        title="MCP 服务器"
        sub="统一管理平台接入的 MCP 端点，引用次数和最近同步时间一目了然。"
        backHref="/console"
        backLabel="返回管理概览"
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => toast("[演示] 打开 JSON 配置导入对话框…")}>
              <IconUpload size={14} /> 导入配置
            </button>
            <button type="button" className="btn btn-primary" onClick={openAdd}>
              <IconPlus size={14} /> 添加 MCP
            </button>
          </>
        }
      />

      <div className="stats">
        <Stat label="服务器总数" value={String(servers.length)} delta={`${online} 在线`} />
        <Stat label="在线" value={String(online)} delta="健康" />
        <Stat label="平均延迟" value={`${avgLatency} ms`} delta="P50" />
        <Stat label="被引用" value={String(totalRefs)} delta="智能体 / 技能" />
      </div>

      <div className="filters">
        <div className="filter-group" role="tablist">
          {TRANSPORT_PILLS.map((f) => (
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
          <input type="search" placeholder="按名称或端点搜索…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>服务器</th>
            <th>传输</th>
            <th>状态</th>
            <th className="num">延迟</th>
            <th className="num">引用</th>
            <th>最近同步</th>
            <th style={{ textAlign: "right" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                暂无符合条件的 MCP 服务器
              </td>
            </tr>
          ) : null}
          {rows.map((s) => (
            <tr key={s.id}>
              <td>
                <div className="name-cell">
                  <span className="avatar" aria-hidden>M</span>
                  <span className="stack">
                    <span className="title">{s.name}</span>
                    <span className="meta">{s.endpoint}</span>
                  </span>
                </div>
              </td>
              <td><span className="badge">{s.transport.toUpperCase()}</span></td>
              <td><StatusBadge status={s.status} /></td>
              <td className="num">{s.latency > 0 ? `${s.latency} ms` : "—"}</td>
              <td className="num">{s.refs}</td>
              <td style={{ color: "var(--muted)" }}>{s.lastSync}</td>
              <td>
                <div className="row-actions">
                  <button className="btn btn-ghost" type="button" title="编辑" onClick={() => openEdit(s)}>
                    <IconPencil size={14} />
                  </button>
                  <button className="btn btn-ghost" type="button" title="测试连接" onClick={() => handleTest(s)}>
                    <IconBolt size={14} />
                  </button>
                  <button className="btn btn-ghost" type="button" title="删除" onClick={() => handleDelete(s)}>
                    <IconTrash size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <McpServerModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSave={(input) => {
          if (editing) {
            setServers((cur) => cur.map((x) => (x.id === editing.id ? { ...x, ...input } : x)));
            toast(`已保存「${input.name}」`);
          } else {
            const next: McpServer = {
              id: `m-${Date.now()}`,
              status: "online",
              latency: Math.round(80 + Math.random() * 220),
              refs: 0,
              lastSync: "刚刚",
              ...input,
            };
            setServers((cur) => [next, ...cur]);
            toast(`已添加「${input.name}」`);
          }
          setModalOpen(false);
        }}
      />
    </ConsoleShell>
  );
}

interface McpServerModalProps {
  open: boolean;
  editing: McpServer | null;
  onClose: () => void;
  onSave: (input: Omit<McpServer, "id" | "status" | "latency" | "refs" | "lastSync">) => void;
}

function McpServerModal({ open, editing, onClose, onSave }: McpServerModalProps) {
  const [name, setName] = useState("");
  const [transport, setTransport] = useState<AgentTransport>("http");
  const [endpoint, setEndpoint] = useState("");
  const [command, setCommand] = useState("");
  const [auth, setAuth] = useState<"none" | "apikey" | "bearer" | "oauth" | "basic">("none");
  const [credential, setCredential] = useState("");
  const [desc, setDesc] = useState("");
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "err">("idle");
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testErr, setTestErr] = useState<string | null>(null);

  // hydrate from editing
  useState(() => {
    if (editing) {
      setName(editing.name);
      setTransport(editing.transport);
      setEndpoint(editing.endpoint.startsWith("http") || editing.endpoint.startsWith("ws") ? editing.endpoint : "");
      setCommand(editing.transport === "stdio" ? editing.endpoint : "");
      setDesc("");
    }
  });

  if (!open) return null;

  function runTest() {
    if (!name.trim()) {
      toast("请先输入名称");
      return;
    }
    const target = transport === "stdio" ? command : endpoint;
    if (!target.trim()) {
      toast(transport === "stdio" ? "请输入启动命令" : "请输入端点 URL");
      return;
    }
    setTestState("testing");
    setTestErr(null);
    window.setTimeout(() => {
      const fail = Math.random() < 0.2;
      if (fail) {
        setTestState("err");
        setTestErr("鉴权失败：API key 已被吊销");
        setTestLatency(null);
      } else {
        setTestState("ok");
        setTestLatency(Math.round(80 + Math.random() * 220));
      }
    }, 500);
  }

  function save() {
    if (!name.trim()) {
      toast("请先输入名称");
      return;
    }
    onSave({
      name: name.trim(),
      transport,
      endpoint: transport === "stdio" ? command.trim() : endpoint.trim(),
    });
  }

  const authHelp: Record<string, string> = {
    oauth: "粘贴 OAuth access token，或留空走授权流程。",
    apikey: "例如 x-api-key: sk-… — 以 HTTP Header 发送。",
    bearer: "Bearer token，将以 Authorization 头发送。",
    basic: "格式 username:password。",
  };

  return (
    <div className="modal-backdrop is-open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: "min(620px, 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2>{editing ? "编辑 MCP 服务器" : "添加 MCP 服务器"}</h2>
            <p className="sub">{editing ? "修改端点、传输方式或鉴权配置。" : "配置一个外部 MCP 服务器，连接后可在新建智能体时引用。"}</p>
          </div>
          <button className="btn btn-ghost" type="button" onClick={onClose} aria-label="关闭">
            <IconX size={14} />
          </button>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="mcpName">名称</label>
          <input id="mcpName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：OpenAI Tools" />
        </div>

        <div className="field">
          <label htmlFor="mcpTransport">传输方式</label>
          <select id="mcpTransport" value={transport} onChange={(e) => setTransport(e.target.value as AgentTransport)}>
            <option value="http">HTTP</option>
            <option value="stdio">STDIO</option>
            <option value="websocket">WebSocket</option>
          </select>
        </div>

        {transport === "stdio" ? (
          <div className="field">
            <label htmlFor="mcpCommand">启动命令</label>
            <input id="mcpCommand" type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="node ./mcp/filesystem.mjs" />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="mcpEndpoint">端点 URL</label>
            <input id="mcpEndpoint" type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://mcp.example.com/v1" />
          </div>
        )}

        <div className="field">
          <label htmlFor="mcpAuth">鉴权方式</label>
          <select id="mcpAuth" value={auth} onChange={(e) => setAuth(e.target.value as typeof auth)}>
            <option value="none">无</option>
            <option value="apikey">API Key</option>
            <option value="bearer">Bearer</option>
            <option value="oauth">OAuth 2.0</option>
            <option value="basic">Basic</option>
          </select>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>{auth === "none" ? "凭据加密保存。" : authHelp[auth]}</p>
        </div>

        {auth !== "none" ? (
          <div className="field">
            <label htmlFor="mcpCredential">凭据</label>
            <input id="mcpCredential" type="password" value={credential} onChange={(e) => setCredential(e.target.value)} placeholder="••••••••" />
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="mcpDesc">描述（可选）</label>
          <textarea id="mcpDesc" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div className="card" style={{ background: testState === "idle" ? "var(--surface-2)" : testState === "err" ? "var(--danger-soft)" : "var(--accent-soft)", marginTop: 8, padding: 14 }}>
          {testState === "idle" ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>尚未测试连接</span>
              <button type="button" className="btn btn-secondary" onClick={runTest}>
                <IconBolt size={14} /> 测试连接
              </button>
            </div>
          ) : testState === "testing" ? (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>测试中…</div>
          ) : testState === "ok" ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="badge badge-ok"><IconCheck size={10} /> 已连接</span>
                <span style={{ fontSize: 13 }}>{testLatency} ms</span>
              </div>
              <button type="button" className="btn btn-ghost" onClick={runTest}>重测</button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="badge badge-danger">失败</span>
                <span style={{ fontSize: 13, color: "var(--danger)" }}>{testErr}</span>
              </div>
              <button type="button" className="btn btn-ghost" onClick={runTest} style={{ marginTop: 8 }}>重试</button>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button type="button" className="btn btn-primary" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
}
