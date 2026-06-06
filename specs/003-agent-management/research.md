# 研究记录：智能体创建与发布

**输入**：spec.md 5 项 clarifications（私有 CRUD / 无版本 / 管理员停用 / 工具沙箱在 003 / 无需审核）+ 002-account-auth 收口实证。

**前置**：所有技术决策基于 002 收口已落地的 stack，**无**新引入的 NEEDS CLARIFICATION。

## Decision: 沿用 002 微服务基线（auth + agent 同源）

**Rationale**:
- 002 收口产出的 `bbird-hive-server/shared/security` 已提供 session principal + AuthorizationContext，agent-service 复用即可，无需新引入鉴权框架
- 雪花 ID 风格已统一（MyBatis-Plus `IdType.ASSIGN_ID` + JSON 字符串序列化），agent 表主外键保持 Long
- MyBatis-Plus `IdType.ASSIGN_ID` 已在 31 个 java 文件落地，无新依赖
- Spring Boot 3.3 + Spring Cloud Alibaba AI 在 002 收口已验证可启动，agent-service 复用父 pom

**Alternatives considered**:
- **新建独立微服务 + 自带鉴权**：增加维护成本与跨服务调用时延；session cookie 共享已满足
- **把智能体塞入 auth-service**：违反微服务边界原则（auth-service 职责是身份，agent-service 职责是智能体）
- **使用 Spring Authorization Server 自建 OAuth2**：超出 003 范围，与 constitution 的"复用"原则相悖

## Decision: 智能体仅 ACTIVE / DISABLED 两态（无草稿/发布/归档）

**Rationale**:
- 用户在 Q2/Q3 明确"不需要发布流程"+"不需要归档"
- 私有 ACL 下，状态对创建者无意义（永远 ACTIVE 可用）；状态仅对**跨用户/管理员**场景有意义
- ACTIVE ↔ DISABLED 双向迁移由 admin 单方面触发，事件类型 5 类（CREATED / UPDATED / DELETED / DISABLED_BY_ADMIN / RESTORED_BY_ADMIN）
- 减少状态机复杂度 → 减少测试用例数

**Alternatives considered**:
- **ACTIVE / DRAFT / PUBLISHED / DISABLED / ARCHIVED 5 态**：用户拒绝（无发布、无归档）
- **只 ACTIVE 单态，admin 只能"隐藏"**：删除仍是 owner 行为，与 US3 治理意图不符
- **引入 soft-delete 标记**：与 admin 停用语义重叠

## Decision: 工具白/黑名单 + 沙箱约束在 003 持久化，运行时下发在 007

**Rationale**:
- 用户在 Q4 明确"003 实现"
- 003 持久化但不**执行**（没有运行时 = 没有执行风险）
- 007 启动智能体时按 JSON schema 读取，保证契约稳定
- schema 定义在 `lib/api/toolConfig.ts` + `lib/api/sandboxConstraint.ts`（前端）镜像到后端 `ToolConfigService` / `SandboxConstraintService` 的校验逻辑（同一 JSON schema）

**Alternatives considered**:
- **把工具与沙箱放到 007 持久化**：智能体创建时如果 toolConfig 字段不存在，agent 表无法独立管理；用户体验差
- **003 + 007 各定义一份 schema**：必然漂移；违背 DRY
- **用 Protocol Buffers 替代 JSON**：前端编辑器实现成本高，无明显收益

## Decision: 普通用户仅可见自己智能体，他人访问返回 404（不暴露存在性）

**Rationale**:
- 私有 ACL 下，admin 是唯一跨用户查询方
- 404 比 403 更安全：不暴露智能体是否存在（防止通过错误码枚举他人智能体 ID）
- 与 GitHub private repo 模式一致

**Alternatives considered**:
- **403 Forbidden**：暴露存在性，泄露用户活跃度信息
- **200 + 空数据**：不暴露存在性但用户难以区分"我输了错 ID"vs"无权限"，UX 差

## Decision: 软上限每人 50 智能体 + 工具 100 项 + 沙箱 50 路径

**Rationale**:
- 002 收口时 `auth_user` 单表设计（无强 schema 限额）；003 引入数量约束
- 50 智能体/人是合理设计上限（一般用户不会创建 50+）；管理员可豁免（service 层判断角色）
- 工具 100 项是 MCP 工具注册表常见规模；沙箱 50 路径避免 JSON 字段无限膨胀

**Alternatives considered**:
- **硬上限（DB CHECK 约束）**：回滚困难；管理员特权用户无法突破
- **无上限**：恶意用户可能 OOM 数据库（提交超大 JSON）

## Decision: 工具注册表从 MCP 服务发现，而非本服务管理

**Rationale**:
- 工具的"是否可用"由 007 + AgentScope + MCP server 决定
- 003 持久化的"白/黑名单"是 **用户对工具的偏好**，不是"工具注册表"
- 003 schema 校验只校验格式（白/黑名单项必须是字符串，路径必须是绝对路径等），不验证工具存在性
- 007 启动时校验：白名单中不存在的工具自动降级到空集 + 记录 warning

**Alternatives considered**:
- **003 维护完整工具注册表**：超出 003 范围；007 才是 MCP 集成的边界
- **003 调用 MCP 服务做在线校验**：003 阶段 MCP 服务未启动；解耦失败

## Decision: 删除被引用智能体的"取消引用并删除"语义

**Rationale**:
- 用户 US2 验收 2/3 要求"阻止删除被引用 + 提供降级标记"
- "取消引用并删除"是常见 CRDT 软删除模式
- 引用方（004 会话、005 需求）保留 agentId 字段；删除后读取时通过降级标记显示"该智能体已删除"
- 物理删除 + 引用方标记 `agentDeleted=true` 避免数据不一致

**Alternatives considered**:
- **CASCADE 物理删除**：破坏历史会话/需求（用户明确要求"历史记录必须保留"边界情况）
- **强制不删**：用户体验差，无法清理资源
- **乐观锁版本号（取代硬删）**：复杂度过高，admin 视角下不应允许软删
PLAN_EOF
wc -l specs/003-agent-management/research.md

## Decision: 集成 AgentScope 2.0 Java SDK（ReActAgent 入口）

**Rationale**:
- 宪法 III "AgentScope 作为默认框架" 实质要求 003 用 AgentScope 2.0 真实创建 agent，而非只存元数据
- AgentScope 2.0 最新版本 `2.0.0-RC1`，提供 `io.agentscope.core.agent.Agent` 接口 + `ReActAgent` 默认实现 + `HarnessAgent` 生产级入口
- 003 选 `ReActAgent`（裸 ReAct 循环）而非 `HarnessAgent`：
  - 003 MVP 范围（CRUD + 工具 + 沙箱约束）只触达 ReAct 循环本身
  - `HarnessAgent` 的 workspace/memory/sandbox/subagent 属工程底座，由 007 多轮会话场景负责
  - 依赖更小（`agentscope-core` 即可，不必拉 `agentscope-harness`）
- Model 选型用 `ModelRegistry` 字符串 id 模式：`model("dashscope:qwen-plus")` 自动读 `DASHSCOPE_API_KEY`；可切换 `openai:` / `anthropic:` / `gemini:` / `ollama:` 前缀
- 工具注册：`@Tool` 注解 + `Toolkit.registerTool(Object)` 反射注册；003 将 `toolConfig.allowList` 映射为 `MCP` 客户端 + `@Tool` 类
- 跨服务边界重划：003 暴露 `POST /api/agents/{id}/test` smoke test + `GET /api/agents/{id}/runtime` 给 007；007 不再自行实例化，复用 003 runtime 句柄

**Alternatives considered**:
- **`HarnessAgent`**：含 workspace（AGENTS.md / MEMORY.md / skills/）、Session 持久化、子 agent、HITL 钩子、文件沙箱执行。003 范围不需要这些，引入会让 003 范围爆炸到 007 的领域
- **自己实现 ReAct 循环**：宪法 III 明确"AgentScope 优先承担 Agent 建模、协作和运行语义"；自实现违反宪法
- **用 AgentScope 1.x 兼容模式**：2.0 是 2026 最新主版本，1.x 缺 middleware / structured output / 多模态支持；不走 1.x
- **推迟 AgentScope 集成到 007**：导致 003 仅做 CRUD 元数据，没有"真实创建"；用户反馈后明确要求 003 集成

**Implementation outline**:
- `AgentScopeFactory`：把 `AgentEntity` + `ToolConfigEntity` 翻译成 `ReActAgent.builder()...build()`
- `RuntimeRegistry`：进程内 `Map<agentId, ReActAgent>` 缓存 + 重建策略
- 服务启动 `ApplicationReadyEvent` → 扫 `status=ACTIVE AND runtimeStatus IN (NOT_READY, FAILED)` → lazy rebuild
- `POST /api/agents/{id}/test`：发 `UserMessage("请用一句话介绍你自己")` → `.call(msg, ctx).block()` → 返回文本或错误
- `runtimeStatus` 在 build / smoke test 失败时置为 `FAILED` 并写 `lastSmokeTestError`（不阻塞用户编辑）
