# Implementation Plan: 智能体创建与发布

**Branch**: `003-agent-management` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/Users/sie/work/ai_workspace/bbird-hive-platform/specs/003-agent-management/spec.md`

**Note**: 本 plan 由 `/speckit-plan` 流程生成，沿用 002-account-auth 的 Spring Cloud Alibaba AI 微服务基线，新增独立的 agent-service。

## Summary

实现多智能体平台的智能体创建与管理基础能力：普通用户创建、编辑、删除自己**私有**的智能体（含 MCP 工具白/黑名单与运行沙箱约束），管理员可查看所有智能体并按需停用/恢复（停用需填原因）。技术上按 Web 应用拆分前后端：

- 后端**新增** `bbird-hive-server/services/agent-service`，与 002 收口的 `auth-service` 共享 `bbird-hive-server/shared/security` 鉴权契约与雪花 ID 风格，沿用 Spring Boot 3.3 + MyBatis-Plus + Flyway 持久化智能体元数据、工具配置、沙箱约束和事件，Redis 缓存工具白/黑名单版本与限流计数器。
- 前端**扩展** `bbird-hive-web`，新增 `/agents`（用户列表/创建/编辑/删除）、`/admin/agents`（管理员列表/停用/恢复）路由，组件层放在 `components/agents/`，壳层沿用 002 收口的 `AuthedShell` / `PageHeader`。
- 智能体的运行时下发（MCP 调用、沙箱启动）由 **007-agent-runtime-capabilities** 启动时**只读**读取 003 写入的 schema；schema 在本 plan 与 data-model 中定义为契约。

## Technical Context

**Language/Version**: Java 21 LTS（后端 agent-service）、TypeScript（前端）
**Primary Dependencies**: Maven、Spring Boot 3.3、Spring Cloud Alibaba AI、Spring Security、MyBatis-Plus 3.5、Flyway、MySQL 8、Redis、Next.js 15、React 19、Vercel AI SDK、assistant-ui（前端 chat 预留）
**Storage**: MySQL 8 持久化 `agent` / `agent_tool_config` / `agent_sandbox_constraint` / `agent_event` 表；Redis 缓存工具白/黑名单版本号（5 分钟 TTL）与停用提交防抖（1 秒 TTL）
**Testing**: JUnit 5、Spring Boot Test、MyBatis-Plus Test、契约测试（OpenAPI）、前端 vitest + React Testing Library
**Target Platform**: Linux 容器；Docker 镜像、Kubernetes 部署、本地 Podman 验证
**Project Type**: Web application（新增后端微服务 + 前端扩展）
**Performance Goals**:
- 智能体创建/编辑/删除 P95 < 1.5 秒
- 普通用户列表（分页 size=20）P95 < 500ms
- 管理员列表（按状态/创建人过滤，1000 条）P95 < 800ms
- 工具白/黑名单校验（缓存命中）P95 < 50ms
**Constraints**:
- 私有 ACL：智能体只对 `createdByUserId` 可见，他人访问返回 404（不暴露存在性）
- 软上限：单用户最多 50 个智能体（schema 不硬限，由 service 校验并返回 422）
- 工具白/黑名单最大 100 项，沙箱约束路径白名单最大 50 项
- 状态机：仅 `ACTIVE` / `DISABLED`；管理员停用 → `DISABLED`，管理员恢复 → `ACTIVE`
**Scale/Scope**:
- 1000 - 10000 用户规模，假设单租户 5000 智能体
- 智能体配置大小平均 5 KB，工具白/黑名单 2 KB，沙箱约束 1 KB
- 跨服务契约：agent-service 复用 auth-service 的 session cookie `BBIRD_SESSION` 做鉴权；`requireAdmin` 由 auth-service 的 `AuthorizationService` 语义复刻到 agent-service 本地副本

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **前端主流与易部署优先**：Next.js 15 + TypeScript + React 19，主流、长期维护；前端 `app/agents/` 与 `app/admin/agents/` 复用 002 的 AuthedShell/PageHeader；本地 `npm run dev` + Docker 镜像 + K8s 部署。
- ✅ **Spring Cloud Alibaba AI 微服务后端**：新增 `agent-service` 微服务，职责单一（智能体 CRUD + 管理），不与 auth-service 耦合；通过 session cookie 复用 auth 鉴权；服务边界/配置/服务发现/容错/权限/审计在 plan 中明确。
- ✅ **AgentScope 框架边界**：本 feature **不**实现 Agent 运行时下发，仅持久化配置；007-agent-runtime-capabilities 启动智能体时按 schema 读取，AgentScope 与 Spring Cloud Alibaba AI 边界不重叠；无重复实现。
- ✅ **MySQL 8 + Redis + 可观测**：MySQL 8 持久化 4 张表，Redis 缓存工具版本与限流；结构化日志、指标、审计事件、契约测试齐备。
- ✅ **容器化部署**：Dockerfile、K8s manifest、Podman 本地依赖说明齐备。
- ✅ **可测试与可追溯**：单元 + 契约 + 集成 + 端到端测试；5 类事件（CREATED / UPDATED / DELETED / DISABLED_BY_ADMIN / RESTORED_BY_ADMIN）落库。
- ✅ **中文优先**：所有面向人的文档、计划、任务、对话使用中文。

**Gate Result**: PASS，无宪法违规。

## Project Structure

### Documentation (this feature)

```text
specs/003-agent-management/
├── plan.md              # 本文件（/speckit-plan 输出）
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/           # Phase 1 输出（OpenAPI）
├── tasks.md             # Phase 2 输出（/speckit-tasks，plan 不创建）
├── checklists/
│   └── requirements.md  # 14 项内容质量门禁（已 100% 通过）
└── START_HERE.md        # 启动包（含 5 澄清问题与依赖上下游）
```

### Source Code (repository root)

```text
bbird-hive-server/
├── services/
│   ├── auth-service/                    # 002 收口，agent-service 复用其 session 鉴权
│   └── agent-service/                   # 003 新增
│       ├── src/main/java/com/bbird/agent/
│       │   ├── AgentServiceApplication.java
│       │   ├── api/
│       │   │   ├── AgentController.java          # GET/POST/PUT/DELETE /api/agents
│       │   │   ├── AdminAgentController.java     # GET /api/admin/agents, POST disable/restore
│       │   │   ├── AgentEventController.java     # GET /api/agents/{id}/events（owner only）
│       │   │   ├── ApiExceptionHandler.java
│       │   │   ├── ErrorResponse.java            # 沿用 auth-service 形态
│       │   │   └── dto/
│       │   │       ├── AgentDtos.java            # Create/Update/Response/ListItem
│       │   │       ├── ToolConfigDtos.java
│       │   │       ├── SandboxConstraintDtos.java
│       │   │       └── AgentEventDtos.java
│       │   ├── domain/
│       │   │   ├── AgentEntity.java              # id, name, role, capability, createdBy, status, timestamps
│       │   │   ├── ToolConfigEntity.java         # agent_id, allowList, denyList (JSON), version
│       │   │   ├── SandboxConstraintEntity.java  # agent_id, fsAllowList, networkPolicy, timeouts (JSON)
│       │   │   ├── AgentEventEntity.java         # actor/target/agentId, type, reason, ip/ua, requestId
│       │   │   ├── AgentStatus.java              # ACTIVE / DISABLED
│       │   │   └── AgentEventType.java           # CREATED / UPDATED / DELETED / DISABLED_BY_ADMIN / RESTORED_BY_ADMIN
│       │   ├── mapper/
│       │   │   ├── AgentMapper.java
│       │   │   ├── ToolConfigMapper.java
│       │   │   ├── SandboxConstraintMapper.java
│       │   │   └── AgentEventMapper.java
│       │   ├── service/
│       │   │   ├── AgentService.java             # CRUD + ACL（私有 404 兜底）
│       │   │   ├── AgentAdminService.java        # 列表/停用/恢复（要求原因）
│       │   │   ├── AgentAccessControl.java       # 当前用户解析、owner 校验、admin 守卫
│       │   │   ├── ToolConfigService.java        # 工具白/黑名单版本管理 + Redis 缓存
│       │   │   ├── SandboxConstraintService.java # 沙箱约束 JSON schema 校验
│       │   │   ├── AgentEventService.java        # 写 5 类事件
│       │   │   ├── AgentReferenceGuard.java      # 检查"是否被会话/需求引用"（被引用阻止删除）
│       │   │   └── AgentException.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java           # session cookie + /api/admin/** 守卫
│       │   │   └── RedisConfig.java
│       │   └── bootstrap/
│       │       └── DataInitializer.java          # 启动时检查 schema 必填列、幂等
│       ├── src/main/resources/
│       │   ├── application-local.yml
│       │   └── db/migration/V001__create_agent_tables.sql
│       ├── src/test/java/com/bbird/agent/
│       │   ├── support/AgentServiceTestConfig.java
│       │   ├── service/AgentServiceTest.java
│       │   ├── service/AgentAdminServiceTest.java
│       │   ├── service/ToolConfigServiceTest.java
│       │   └── service/SandboxConstraintServiceTest.java
│       └── pom.xml
└── shared/
    └── security/                                  # 沿用 002 收口的 session 鉴权契约
        ├── SessionPrincipal.java
        └── AuthorizationContext.java

bbird-hive-web/
├── app/
│   ├── agents/
│   │   ├── page.tsx                               # 列表（含搜索 + 状态过滤）
│   │   ├── new/page.tsx                           # 创建
│   │   └── [id]/page.tsx                          # 编辑 / 删除入口
│   └── admin/
│       └── agents/
│           ├── page.tsx                           # 管理员列表（按创建人/状态/停用原因过滤）
│           └── [id]/page.tsx                      # 停用 / 恢复 + 填写原因
├── components/
│   ├── agents/
│   │   ├── AgentForm.tsx                          # 创建/编辑表单（必填校验）
│   │   ├── AgentCard.tsx                          # 列表卡片
│   │   ├── DeleteAgentDialog.tsx                  # 删除二次确认（含被引用警告）
│   │   ├── DisableAgentDialog.tsx                 # 停用原因填写
│   │   ├── RestoreAgentDialog.tsx                 # 恢复原因填写
│   │   └── ToolConfigEditor.tsx                   # 工具白/黑名单 JSON 编辑器（含 schema 校验）
│   └── sandbox/
│       └── SandboxConstraintEditor.tsx            # 沙箱约束 JSON 编辑器
├── lib/
│   ├── api/
│   │   ├── agents.ts                              # list/create/update/delete + 引用探测
│   │   ├── toolConfig.ts                          # 工具白/黑名单 schema 校验（共享给 007）
│   │   └── sandboxConstraint.ts
│   └── console/                                   # 沿用 002

deploy/
├── docker/
│   ├── agent-service.Dockerfile                   # 新增
│   └── build-agent-service.sh                     # 新增
├── k8s/
│   └── agent-service.yaml                         # 新增
└── podman/
    └── agent-dependencies.md                      # 新增

tests/
├── contract/agents/
│   ├── create-agent.contract.test.ts
│   ├── update-agent.contract.test.ts
│   ├── delete-agent.contract.test.ts
│   ├── disable-agent.contract.test.ts
│   ├── restore-agent.contract.test.ts
│   ├── list-agents.contract.test.ts
│   ├── tool-config.contract.test.ts
│   └── sandbox-constraint.contract.test.ts
├── integration/
│   ├── account-agent-create.test.ts               # 跨 002 + 003 鉴权链路
│   ├── account-agent-disable.test.ts
│   └── account-agent-private-acl.test.ts
└── support/
    └── agent-openapi-contract.ts                  # 契约测试支撑
```

**Structure Decision**：
- 沿用 002 收口建立的前后端分离结构与命名约定（`bbird-hive-server/services/<svc>/` + `bbird-hive-web/app/...`）
- agent-service 与 auth-service **同源**（共享 `bbird-hive-server/shared/security` 与 session cookie 契约），不引入新的鉴权框架
- 前端 `app/agents/` 与 `app/admin/agents/` 复用 002 的 `AuthedShell` / `PageHeader` / `TopNav` 壳层
- 工具与沙箱约束的 **JSON schema** 在 `lib/api/toolConfig.ts` + `lib/api/sandboxConstraint.ts` 中定义，前后端共享，**007 必须按此 schema 读取**（契约在 Phase 1 contracts/ 落地）

## Phase 0: Research

研究输出见 `specs/003-agent-management/research.md`。所有技术上下文中的关键决策已解析（基于 002 收口的实证 + 5 项 clarifications），无剩余待澄清项。

## Phase 1: Design & Contracts

设计输出：
- `specs/003-agent-management/data-model.md`（4 实体 + JSON schema）
- `specs/003-agent-management/contracts/openapi.yaml`（HTTP API 契约）
- `specs/003-agent-management/contracts/agent-config.schema.json`（工具白/黑名单 + 沙箱约束的 JSON schema，007 读取用）
- `specs/003-agent-management/quickstart.md`（本地启动 + Docker + Podman）

## Post-Design Constitution Check

- ✅ 前端扩展继续沿用 Next.js 主流技术栈与 002 收口的壳层
- ✅ agent-service 微服务边界单一（智能体 CRUD），不与 auth-service 耦合
- ✅ 本 feature **不**实现 Agent 运行时下发，仅持久化配置；AgentScope 与 Spring Cloud Alibaba AI 边界在 003 不重叠，留待 007
- ✅ 4 张表与 JSON 字段全在 MySQL 8；Redis 缓存工具版本 + 限流
- ✅ quickstart 覆盖本地 Podman、Docker 镜像和 Kubernetes 验证路径
- ✅ 设计产物包含 5 类审计事件 + 权限拒绝 + 删除引用检测
- ✅ 全部面向人的设计文档使用中文

**Gate Result**: PASS，无宪法违规。

## Complexity Tracking

> **当前无宪法违规，无需记录复杂度例外。**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| （无） | — | — |

