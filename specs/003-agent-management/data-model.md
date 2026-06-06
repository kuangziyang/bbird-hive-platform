# 数据模型：智能体创建与发布

> 本版本所有主键 / 外键使用 **雪花 ID**（Long / BIGINT），由 MyBatis-Plus `IdType.ASSIGN_ID` 自动生成；
> 雪花 ID 长度 19 位、单调递增、便于分库分表与时间排序。API 层以字符串形式序列化以避免 JavaScript 64 位精度损失。
> 工具白/黑名单与沙箱约束以 **JSON 字符串** 持久化（MySQL 5.7 兼容），JSON schema 在 `contracts/agent-config.schema.json` 中定义，**前后端共用同一份 schema**。

## Entity: Agent

普通用户私有创建的智能体主表。

**持久化说明**: 使用 MyBatis-Plus 对应智能体表实体、Mapper 和 Service；`createdByUserId` 建立索引；`status + createdByUserId` 复合索引支持按状态过滤。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long (雪花) | 必填，唯一 | 智能体主键 |
| name | String | 必填，1-50 字符 | 智能体名称（同一用户下唯一） |
| role | String | 必填，1-30 字符 | 智能体角色（例：`researcher` / `coder` / `planner`） |
| capability | String | 必填，10-2000 字符 | 能力描述（纯文本） |
| createdByUserId | Long (雪花) | 必填 | 创建者；`users.id`（auth-service 跨服务） |
| status | Enum | 必填 | `ACTIVE` / `DISABLED` |
| disabledByAdminId | Long (雪花) | 可空 | 停用管理员；`users.id` |
| disabledReason | String | 可空，1-500 字符 | 停用原因（管理员动作必填） |
| disabledAt | DateTime | 可空 | 停用时间 |
| createdAt | DateTime | 必填 | 创建时间 |
| updatedAt | DateTime | 必填 | 最近更新时间 |

### Validation Rules

- `name` 在 `createdByUserId` 范围内唯一。
- `role` 与 `capability` 必填。
- 软上限：单用户最多 50 个智能体（service 校验，admin 豁免）。
- 普通用户只能创建、编辑、删除自己 `createdByUserId` 的智能体；他人访问返回 404。
- `status` 仅 admin 可从 `ACTIVE` 改为 `DISABLED`（要求 `disabledReason`）；admin 可从 `DISABLED` 恢复。
- 删除被引用的智能体（被 004 会话 / 005 需求引用）必须先"取消引用"。

### State Transitions

```text
(none) → ACTIVE : 普通用户创建（无需审核）
ACTIVE → (deleted) : 普通用户删除（需未被引用，或先取消引用）
ACTIVE → DISABLED : 管理员停用（必须填原因）
DISABLED → ACTIVE : 管理员恢复（必须填原因）
```

### Index Strategy

- 唯一索引：`(createdByUserId, name)`
- 普通索引：`status`、`createdByUserId`、`updatedAt`
- 复合索引：`(createdByUserId, status, updatedAt)` 支持「我的活跃智能体按时间倒序」

## Entity: ToolConfig

智能体可调用的 MCP 工具白/黑名单。**003 持久化，007 运行时下发**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long (雪花) | 必填，唯一 | 主键 |
| agentId | Long (雪花) | 必填，唯一 | 所属智能体 |
| allowList | JSON String | 可空 | 工具白名单（`["tool1", "tool2"]`），最大 100 项 |
| denyList | JSON String | 可空 | 工具黑名单（`["tool3"]`），最大 100 项 |
| version | Int | 必填，默认 1 | 配置版本号（用于 007 检测变更） |
| createdAt | DateTime | 必填 | 创建时间 |
| updatedAt | DateTime | 必填 | 最近更新时间 |

### Validation Rules

- 同一 `agentId` 只能有 1 条 ToolConfig（1:1 关系）。
- `allowList` 与 `denyList` 不允许同时非空（互斥，避免语义模糊）。
- 每项必须是字符串，且非空。
- `version` 单调递增，每次 UPDATE 自增。

### JSON Schema（与 `contracts/agent-config.schema.json` 一致）

```json
{
  "type": "object",
  "properties": {
    "allowList": {
      "type": "array",
      "items": { "type": "string", "minLength": 1, "maxLength": 100 },
      "maxItems": 100,
      "uniqueItems": true
    },
    "denyList": {
      "type": "array",
      "items": { "type": "string", "minLength": 1, "maxLength": 100 },
      "maxItems": 100,
      "uniqueItems": true
    }
  },
  "additionalProperties": false
}
```

## Entity: SandboxConstraint

智能体运行时的隔离参数。**003 持久化，007 运行时下发**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long (雪花) | 必填，唯一 | 主键 |
| agentId | Long (雪花) | 必填，唯一 | 所属智能体 |
| fsAllowList | JSON String | 可空 | filesystem 路径白名单（`["/tmp", "/workspace"]`），最大 50 项 |
| networkPolicy | JSON String | 可空 | 网络出/入策略（`{"egress": "allow", "ingress": "deny"}`） |
| timeouts | JSON String | 可空 | CPU/内存/超时（`{"cpuSeconds": 60, "memoryMb": 512, "wallClockSeconds": 300}`） |
| createdAt | DateTime | 必填 | 创建时间 |
| updatedAt | DateTime | 必填 | 最近更新时间 |

### Validation Rules

- 同一 `agentId` 只能有 1 条 SandboxConstraint（1:1 关系）。
- `fsAllowList` 每项必须是绝对路径（`/...` 开头），最大 50 项。
- `networkPolicy.egress` 只能是 `allow` / `deny`；`ingress` 只能是 `deny`（agent-service 暂不开放 ingress）。
- `timeouts` 必须有 `wallClockSeconds`（必填），其他可选。
- timeouts 默认值：`cpuSeconds=60, memoryMb=512, wallClockSeconds=300`。

### JSON Schema

```json
{
  "type": "object",
  "properties": {
    "fsAllowList": {
      "type": "array",
      "items": { "type": "string", "pattern": "^/.*" },
      "maxItems": 50,
      "uniqueItems": true
    },
    "networkPolicy": {
      "type": "object",
      "properties": {
        "egress": { "enum": ["allow", "deny"] },
        "ingress": { "enum": ["deny"] }
      },
      "required": ["egress"]
    },
    "timeouts": {
      "type": "object",
      "properties": {
        "cpuSeconds": { "type": "integer", "minimum": 1, "maximum": 3600 },
        "memoryMb": { "type": "integer", "minimum": 64, "maximum": 8192 },
        "wallClockSeconds": { "type": "integer", "minimum": 1, "maximum": 3600 }
      },
      "required": ["wallClockSeconds"]
    }
  },
  "additionalProperties": false
}
```

## Entity: AgentEvent

智能体关键操作审计事件（5 类）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long (雪花) | 必填，唯一 | 主键 |
| type | Enum | 必填 | `CREATED` / `UPDATED` / `DELETED` / `DISABLED_BY_ADMIN` / `RESTORED_BY_ADMIN` |
| actorUserId | Long (雪花) | 必填 | 操作者 |
| targetAgentId | Long (雪花) | 必填 | 目标智能体 |
| reason | String | 可空，1-500 字符 | 原因（admin 动作必填） |
| ip | String | 可空 | 客户端 IP |
| userAgent | String | 可空 | 客户端 UA |
| requestId | String | 可空 | 跨服务 requestId（与 002 统一） |
| createdAt | DateTime | 必填 | 时间 |

### Index Strategy

- 复合索引：`(targetAgentId, createdAt)` 支持"某智能体的事件流"
- 复合索引：`(type, createdAt)` 支持"按事件类型过滤"
- 普通索引：`actorUserId`

## Entity 关系图

```text
┌────────────────────────┐
│      Agent             │
│  (createdByUserId)     │◀─── 由 auth-service 引用（跨服务外键）
└──────────┬─────────────┘
           │ 1:1
           ├──────────────┐
           ▼              ▼
┌─────────────────┐ ┌──────────────────┐
│   ToolConfig    │ │ SandboxConstraint│
└─────────────────┘ └──────────────────┘

┌────────────────────────┐
│     AgentEvent         │
│  (targetAgentId → A)   │
│  (actorUserId → A)     │
└────────────────────────┘
```

## 跨服务契约（003 ↔ 002 ↔ 007）

- **003 → 002**：`createdByUserId` / `disabledByAdminId` 引用 `auth_service.users.id`（跨服务外键，**不**做 DB 强约束，由 agent-service 调用 auth-service 校验存在性；或缓存 user 快照，TTL 5 分钟）
- **003 → 004/005**：智能体被 `chat_session` / `demand_pool` 引用，由 004/005 在引用方存 `agentId` + `agentDeleted` 软标记
- **003 → 007**：007 启动智能体时**只读**读取本表 + ToolConfig + SandboxConstraint，**不**做写操作；按 `contracts/agent-config.schema.json` 校验输入

