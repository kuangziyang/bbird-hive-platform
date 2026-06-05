export type AgentStatus = "active" | "draft" | "paused";
export type AgentTransport = "http" | "stdio" | "websocket";

export interface Agent {
  id: string;
  name: string;
  mark: string;
  description: string;
  mcps: string[];
  skills: number;
  status: AgentStatus;
  calls: number;
  lastUsed: string;
  owner: "me" | "team";
}

export interface McpServer {
  id: string;
  name: string;
  transport: AgentTransport;
  endpoint: string;
  status: "online" | "degraded" | "offline";
  latency: number;
  refs: number;
  lastSync: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  body: string;
  actor: string;
}

export const USER_AGENTS: Agent[] = [
  {
    id: "u-1",
    name: "研究助理",
    mark: "研",
    description: "汇总行业资料并产出结构化简报。",
    mcps: ["openai", "notion"],
    skills: 6,
    status: "active",
    calls: 1284,
    lastUsed: "12 分钟前",
    owner: "me",
  },
  {
    id: "u-2",
    name: "数据整理",
    mark: "数",
    description: "把 CSV/Excel 转成可分析的结构化表格。",
    mcps: ["openai"],
    skills: 3,
    status: "active",
    calls: 612,
    lastUsed: "1 小时前",
    owner: "me",
  },
  {
    id: "u-3",
    name: "周报助手",
    mark: "周",
    description: "根据本周任务与会议自动生成周报草稿。",
    mcps: ["notion", "slack"],
    skills: 4,
    status: "draft",
    calls: 0,
    lastUsed: "尚未使用",
    owner: "me",
  },
  {
    id: "u-4",
    name: "代码审阅",
    mark: "码",
    description: "针对 PR 做差异审阅与风险点提示。",
    mcps: ["github", "openai"],
    skills: 5,
    status: "paused",
    calls: 89,
    lastUsed: "3 天前",
    owner: "me",
  },
];

export const ADMIN_AGENTS: Agent[] = [
  {
    id: "a-1",
    name: "客户洞察引擎",
    mark: "客",
    description: "面向客户成功团队的洞察分析。",
    mcps: ["openai", "hubspot"],
    skills: 8,
    status: "active",
    calls: 4320,
    lastUsed: "5 分钟前",
    owner: "team",
  },
  {
    id: "a-2",
    name: "差旅智能体",
    mark: "差",
    description: "为员工安排差旅行程与报销。",
    mcps: ["amadeus", "concur"],
    skills: 4,
    status: "active",
    calls: 1502,
    lastUsed: "22 分钟前",
    owner: "team",
  },
  {
    id: "a-3",
    name: "合同审阅",
    mark: "合",
    description: "读取 PDF 合同并标注关键条款。",
    mcps: ["openai", "docusign"],
    skills: 5,
    status: "active",
    calls: 873,
    lastUsed: "2 小时前",
    owner: "team",
  },
  {
    id: "a-4",
    name: "知识库检索",
    mark: "知",
    description: "在内部知识库中检索并给出引用。",
    mcps: ["notion", "confluence"],
    skills: 7,
    status: "degraded" as AgentStatus,
    calls: 2841,
    lastUsed: "30 分钟前",
    owner: "team",
  },
  {
    id: "a-5",
    name: "BI 报告",
    mark: "报",
    description: "对接数仓自动产出周/月报。",
    mcps: ["metabase", "openai"],
    skills: 6,
    status: "active",
    calls: 1190,
    lastUsed: "1 小时前",
    owner: "team",
  },
];

export const MCP_SERVERS: McpServer[] = [
  {
    id: "m-1",
    name: "OpenAI Tools",
    transport: "http",
    endpoint: "https://mcp.openai.example/v1",
    status: "online",
    latency: 142,
    refs: 12,
    lastSync: "刚刚",
  },
  {
    id: "m-2",
    name: "Notion 内部知识",
    transport: "http",
    endpoint: "https://mcp.notion.example/v1",
    status: "online",
    latency: 218,
    refs: 7,
    lastSync: "2 分钟前",
  },
  {
    id: "m-3",
    name: "本地文件 MCP",
    transport: "stdio",
    endpoint: "node ./mcp/filesystem.mjs",
    status: "degraded",
    latency: 0,
    refs: 3,
    lastSync: "1 小时前",
  },
  {
    id: "m-4",
    name: "GitLab 仓库",
    transport: "http",
    endpoint: "https://mcp.gitlab.example/v1",
    status: "online",
    latency: 96,
    refs: 4,
    lastSync: "10 分钟前",
  },
  {
    id: "m-5",
    name: "旧版飞书",
    transport: "websocket",
    endpoint: "wss://mcp.feishu.example/socket",
    status: "offline",
    latency: 0,
    refs: 0,
    lastSync: "2 天前",
  },
];

export const ACTIVITY: ActivityItem[] = [
  { id: "f-1", time: "刚刚", body: "研究助理 完成一次简报生成（耗时 8.4s）", actor: "me" },
  { id: "f-2", time: "12 分钟前", body: "数据整理 导出一份 2026Q1 销售表", actor: "me" },
  { id: "f-3", time: "34 分钟前", body: "差旅智能体 调度了一个跨城会议", actor: "team" },
  { id: "f-4", time: "1 小时前", body: "代码审阅 暂存，等待你的反馈", actor: "me" },
];

export const USER_STATS = {
  agents: USER_AGENTS.filter((a) => a.owner === "me").length,
  activeAgents: USER_AGENTS.filter((a) => a.status === "active").length,
  calls: USER_AGENTS.reduce((sum, a) => sum + a.calls, 0),
  requests: 3,
};

export const ADMIN_STATS = {
  agents: ADMIN_AGENTS.length,
  activeAgents: ADMIN_AGENTS.filter((a) => a.status === "active").length,
  totalCalls: ADMIN_AGENTS.reduce((sum, a) => sum + a.calls, 0),
  mcpServers: MCP_SERVERS.length,
  mcpOnline: MCP_SERVERS.filter((m) => m.status === "online").length,
};
