"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../components/shell/useCurrentUser";
import { ConsoleShell } from "../../components/shell/ConsoleShell";
import { PageHeader } from "../../components/shell/PageHeader";
import { AgentTable } from "../../components/shell/AgentTable";
import { CreateAgentModal } from "../../components/shell/CreateAgentModal";
import { ACTIVITY, ADMIN_AGENTS, ADMIN_STATS, USER_AGENTS, USER_STATS, type Agent } from "../../lib/console/mock";
import { IconPlus, IconUpload } from "../../components/shell/Icon";
import { toast } from "../../components/shell/Toast";

function Stat({ label, value, delta, neg }: { label: string; value: string; delta?: string; neg?: boolean }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta ? <div className={`delta${neg ? " neg" : ""}`}>{delta}</div> : null}
    </div>
  );
}

export default function ConsolePage() {
  const { user, error } = useCurrentUser();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [userAgents, setUserAgents] = useState<Agent[]>(USER_AGENTS);
  const [adminAgents, setAdminAgents] = useState<Agent[]>(ADMIN_AGENTS);

  if (error) {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return null;
  }
  if (!user) {
    return <main className="login-page"><p className="login-sub">正在加载账号…</p></main>;
  }

  const isAdmin = user.role === "ADMIN";
  const stats = isAdmin ? ADMIN_STATS : USER_STATS;
  const visibleUserAgents = userAgents;
  const visibleAdminAgents = adminAgents;

  function toggleAdminAgent(id: string) {
    setAdminAgents((cur) =>
      cur.map((a) =>
        a.id === id ? { ...a, status: a.status === "paused" ? "active" : "paused" } : a
      )
    );
  }

  return (
    <ConsoleShell user={user}>
      <PageHeader
        title={isAdmin ? "平台管理概览" : "工作台"}
        sub={isAdmin ? "查看全平台智能体、需求、运行状态，进行资源调度和审计。" : "管理你创建和使用的智能体，处理需求与协作群聊。"}
        actions={
          isAdmin ? (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => toast("打开导入配置…")}>
                <IconUpload size={14} /> 导入配置
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                <IconPlus size={14} /> 创建智能体
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <IconPlus size={14} /> 新建智能体
            </button>
          )
        }
      />

      <div className="stats">
        {isAdmin ? (
          <>
            <Stat label="全部智能体" value={String(stats.agents)} delta="+3 本周" />
            <Stat label="运行中" value={String(stats.activeAgents)} delta={`${stats.mcpOnline} MCP 在线`} />
            <Stat label="MCP 服务器" value={String(stats.mcpServers)} delta={`${stats.mcpOnline} 健康`} />
            <Stat label="近 7 日调用" value={stats.totalCalls.toLocaleString()} delta="+18%" />
          </>
        ) : (
          <>
            <Stat label="我的智能体" value={String(stats.agents)} delta="+1 本周" />
            <Stat label="运行中" value={String(stats.activeAgents)} delta="健康" />
            <Stat label="累计调用" value={stats.calls.toLocaleString()} delta="+24%" />
            <Stat label="进行中的需求" value={String(stats.requests)} delta="2 待确认" />
          </>
        )}
      </div>

      <PageHeader
        title={isAdmin ? "全部智能体" : "我的智能体"}
        sub={isAdmin ? "管理员可暂停、编辑或删除任意智能体。" : "暂停、发布或对你的智能体做调整。"}
      />

      <AgentTable
        agents={isAdmin ? visibleAdminAgents : visibleUserAgents}
        showOwner={isAdmin}
        onTogglePause={isAdmin ? toggleAdminAgent : undefined}
      />

      <div style={{ marginTop: 32 }}>
        <PageHeader title="最近活动" sub="本账号触发或参与的最新事件" />
        <div className="feed">
          {ACTIVITY.map((f) => (
            <div className="feed-item" key={f.id}>
              <span className="time">{f.time}</span>
              <span className="body">{f.body}</span>
            </div>
          ))}
        </div>
      </div>

      <CreateAgentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onPublish={(input) => {
          const next: Agent = {
            id: `${isAdmin ? "a" : "u"}-${Date.now()}`,
            name: input.name,
            mark: input.name.slice(0, 2).toUpperCase(),
            description: input.description,
            mcps: input.mcps,
            skills: input.skills.length || 1,
            status: "active",
            calls: 0,
            lastUsed: "刚刚",
            owner: isAdmin ? "team" : "me",
          };
          if (isAdmin) {
            setAdminAgents((cur) => [next, ...cur]);
          } else {
            setUserAgents((cur) => [next, ...cur]);
          }
          setCreateOpen(false);
          toast(`已发布「${input.name}」`);
        }}
        onSaveDraft={(input) => {
          const next: Agent = {
            id: `${isAdmin ? "a" : "u"}-${Date.now()}`,
            name: input.name,
            mark: input.name.slice(0, 2).toUpperCase(),
            description: input.description,
            mcps: ["openai"],
            skills: 0,
            status: "draft",
            calls: 0,
            lastUsed: "尚未使用",
            owner: isAdmin ? "team" : "me",
          };
          if (isAdmin) {
            setAdminAgents((cur) => [next, ...cur]);
          } else {
            setUserAgents((cur) => [next, ...cur]);
          }
          setCreateOpen(false);
          toast(`已保存草稿「${input.name}」`);
        }}
      />
    </ConsoleShell>
  );
}
