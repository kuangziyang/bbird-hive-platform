# Tasks: 智能体创建与发布

**Input**: Design documents from `specs/003-agent-management/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `contracts/agent-config.schema.json`, `quickstart.md`

**Tests**: 本 feature 涉及跨服务鉴权、私有 ACL、5 类审计事件、跨服务契约，按宪法质量门禁生成单元测试、契约测试和集成测试任务。

**Organization**: 任务按用户故事分组（US1 创建-编辑-查看 / US2 删除 / US3 管理员停用-恢复），确保每个故事可独立实现、测试和验收。工具白/黑名单与沙箱约束编辑器作为 US1 内部子任务（FR-009）。

**Clarifications（2026-06-05）**:
- 智能体仅**私有**（owner 可见，他人 404）
- **无版本、无发布**（仅 CRUD）
- 仅 `ACTIVE` / `DISABLED` 两态（无归档）
- 工具 + 沙箱**在 003 持久化**（007 运行时下发）
- 创建**无需审核**

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行，且不会修改同一文件或依赖未完成任务。
- **[Story]**: 用户故事阶段任务必须标注，例如 `[US1]`。
- 每个任务描述都包含明确文件路径。

---

## Phase 1: Setup

**Purpose**: 初始化 agent-service Maven 微服务骨架、共享模块依赖、前端扩展目录和部署占位。

- [ ] T001 创建 agent-service Maven 项目骨架于 `bbird-hive-server/services/agent-service/pom.xml`，复用 002 收口的父 pom
- [ ] T002 [P] 创建 agent-service 源码目录结构于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/`
- [ ] T003 [P] 创建 agent-service 测试目录结构于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/`
- [ ] T004 [P] 引用 shared/security 鉴权契约模块于 `bbird-hive-server/services/agent-service/pom.xml`（复用 002 收口，与 auth-service 同源）
- [ ] T005 创建 application-local.yml 配置样例于 `bbird-hive-server/services/agent-service/src/main/resources/application-local.yml`（MySQL 8 / Redis / 8082 端口）
- [ ] T006 [P] 创建 application.yml 公共配置于 `bbird-hive-server/services/agent-service/src/main/resources/application.yml`
- [ ] T007 [P] 创建 agent-service 健康检查端点契约于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/HealthCheckConfig.java`
- [ ] T008 [P] 创建前端扩展目录结构于 `bbird-hive-web/app/agents/` 和 `bbird-hive-web/app/admin/agents/`
- [ ] T009 [P] 创建前端组件目录于 `bbird-hive-web/components/agents/` 和 `bbird-hive-web/components/sandbox/`
- [ ] T010 [P] 创建前端 API 客户端目录于 `bbird-hive-web/lib/api/`
- [ ] T011 创建 Dockerfile 于 `deploy/docker/agent-service.Dockerfile`
- [ ] T012 [P] 创建 Docker 构建脚本于 `deploy/docker/build-agent-service.sh`
- [ ] T013 [P] 创建 Kubernetes 部署清单于 `deploy/k8s/agent-service.yaml`
- [ ] T014 [P] 创建 Podman 本地依赖说明于 `deploy/podman/agent-dependencies.md`

**Checkpoint**: 项目骨架就绪，agent-service 可以 `mvn compile` 通过。

---

## Phase 2: Foundational

**Purpose**: 完成所有用户故事共享的实体、数据库迁移、Mapper、Redis、雪花 ID、鉴权集成、审计基础和契约校验。

**Critical**: 本阶段完成前不得开始用户故事实现。

- [ ] T015 配置 Maven 完整依赖（Spring Boot 3.3 / Spring Cloud Alibaba AI / Spring Security / MyBatis-Plus 3.5 / Flyway / MySQL / Redis / Validation / JSON Schema 校验 / 测试 / **AgentScope 2.0 `io.agentscope:agentscope-core:2.0.0-RC1`**）于 `bbird-hive-server/services/agent-service/pom.xml`
- [ ] T016 [P] 创建 Agent 实体类于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/domain/AgentEntity.java`（**16 字段**：id / name / role / capability / **model**（默认 `dashscope:qwen-plus`）/ **provider** / createdByUserId / status / **runtimeStatus**（`NOT_READY` / `READY` / `FAILED`）/ **runtimeMessage** / **lastSmokeTestAt** / **lastSmokeTestError** / disabledByAdminId / disabledReason / disabledAt / createdAt / updatedAt）
- [ ] T017 [P] 创建 ToolConfig 实体类于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/domain/ToolConfigEntity.java`（1:1 关联 Agent）
- [ ] T018 [P] 创建 SandboxConstraint 实体类于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/domain/SandboxConstraintEntity.java`（1:1 关联 Agent）
- [ ] T019 [P] 创建 AgentEvent 实体类于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/domain/AgentEventEntity.java`（5 类事件）
- [ ] T020 [P] 创建 AgentStatus 枚举于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/domain/AgentStatus.java`（`ACTIVE` / `DISABLED`）
- [ ] T020a [P] 创建 RuntimeStatus 枚举于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/domain/RuntimeStatus.java`（`NOT_READY` / `READY` / `FAILED`）
- [ ] T021 [P] 创建 AgentEventType 枚举于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/domain/AgentEventType.java`（`CREATED` / `UPDATED` / `DELETED` / `DISABLED_BY_ADMIN` / `RESTORED_BY_ADMIN`）
- [ ] T022 创建 Flyway 迁移脚本 V001 于 `bbird-hive-server/services/agent-service/src/main/resources/db/migration/V001__create_agent_tables.sql`（4 张表：agent / agent_tool_config / agent_sandbox_constraint / agent_event，含所有索引与唯一约束；`agent` 表新增 `model` / `provider` / `runtime_status` / `runtime_message` / `last_smoke_test_at` / `last_smoke_test_error` 列与 `runtime_status` 普通索引）
- [ ] T023 创建 Agent Mapper 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/mapper/AgentMapper.java`（继承 `BaseMapper<AgentEntity>`，启用 `IdType.ASSIGN_ID`）
- [ ] T024 [P] 创建 ToolConfig Mapper 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/mapper/ToolConfigMapper.java`
- [ ] T025 [P] 创建 SandboxConstraint Mapper 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/mapper/SandboxConstraintMapper.java`
- [ ] T026 [P] 创建 AgentEvent Mapper 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/mapper/AgentEventMapper.java`
- [ ] T027 创建 Redis 缓存配置于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/RedisConfig.java`（工具白/黑名单版本号 5 分钟 TTL，停用提交防抖 1 秒 TTL）
- [ ] T028 创建雪花 ID 全局配置于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/MybatisPlusConfig.java`（注册 `IdType.ASSIGN_ID` 与 Long → String JSON 序列化器）
- [ ] T029 集成 shared/security 会话鉴权于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/SecurityConfig.java`（复用 `BBIRD_SESSION` cookie 与 `SessionPrincipal`，注册 `requireAdmin` 拦截器）
- [ ] T030 创建统一异常模型于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/ErrorResponse.java`（沿用 002 `ErrorResponse`，含 code / message / timestamp / requestId / fieldErrors）
- [ ] T031 创建审计事件服务于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentEventService.java`（5 类事件落库，统一 ip / userAgent / requestId 透传）
- [ ] T032 [P] 创建 JSON schema 加载器于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/config/AgentConfigSchemaLoader.java`（启动时加载 `contracts/agent-config.schema.json` 内存缓存）
- [ ] T033 [P] 创建工具白/黑名单 JSON schema 校验器于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/ToolConfigValidator.java`（allowList/denyList 二选一、最大 100 项）
- [ ] T034 [P] 创建沙箱约束 JSON schema 校验器于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/SandboxConstraintValidator.java`（fsAllowList 绝对路径、最大 50 项、networkPolicy/ingress=`deny`、timeouts.wallClockSeconds 必填）
- [ ] T035 创建软上限校验工具于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentLimitService.java`（单用户 50 智能体，admin 豁免）
- [ ] T036 创建可观测基础设施于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/ObservabilityConfig.java`（结构化日志 / 指标 / requestId MDC / 链路追踪）
- [ ] T037 创建后端测试基础配置于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/support/AgentServiceTestContext.java`（Testcontainers MySQL 8 + 嵌入式 Redis 复用，跨用户故事复用）
- [ ] T038 创建契约测试支撑于 `tests/support/agent-openapi-contract.ts`（OpenAPI schema 加载与请求-响应校验工具）

**Checkpoint**: 基础设施就绪，4 张表可迁移完成，鉴权可识别普通用户/管理员，5 类事件可落库。

---

## Phase 3: User Story 1 - 普通用户创建/编辑/查看智能体 (Priority: P1) 🎯 MVP

**Goal**: 普通用户能创建、编辑、查看自己**私有**的智能体（含工具白/黑名单和沙箱约束），他人访问返回 404。

**Independent Test**: 普通用户创建完整智能体（name / role / capability / toolConfig / sandboxConstraint）后能在自己的智能体列表中看到它；用另一普通用户访问该智能体 ID 返回 404；编辑后 `updatedAt` 自动更新。

### Tests for User Story 1

- [ ] T039 [P] [US1] 创建列表契约测试于 `tests/contract/agents/list-agents.contract.test.ts`（按 status / name 过滤 + 分页）
- [ ] T040 [P] [US1] 创建创建契约测试于 `tests/contract/agents/create-agent.contract.test.ts`（201 + 详情 + 雪花 ID 字符串）
- [ ] T041 [P] [US1] 创建详情契约测试于 `tests/contract/agents/get-agent.contract.test.ts`（owner 200 / 非 owner 404）
- [ ] T042 [P] [US1] 创建编辑契约测试于 `tests/contract/agents/update-agent.contract.test.ts`（updatedAt 推进）
- [ ] T043 [P] [US1] 创建工具配置契约测试于 `tests/contract/agents/tool-config.contract.test.ts`（allowList/denyList 互斥、100 项上限、version 自增）
- [ ] T044 [P] [US1] 创建沙箱约束契约测试于 `tests/contract/agents/sandbox-constraint.contract.test.ts`（绝对路径、wallClockSeconds 必填）
- [ ] T045 [P] [US1] 创建 AgentService 单元测试于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/AgentServiceTest.java`（CRUD + 软上限 + 私有 ACL）
- [ ] T046 [P] [US1] 创建工具白/黑名单校验单元测试于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/ToolConfigValidatorTest.java`
- [ ] T047 [P] [US1] 创建沙箱约束校验单元测试于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/SandboxConstraintValidatorTest.java`
- [ ] T048 [P] [US1] 创建前端 AgentForm 组件测试于 `bbird-hive-web/tests/agents/agent-form.spec.tsx`（必填校验 + 工具/沙箱编辑）
- [ ] T049 [P] [US1] 创建前端列表页测试于 `bbird-hive-web/tests/agents/agent-list.spec.tsx`（搜索 + 状态过滤）
- [ ] T050 [P] [US1] 创建登录后创建智能体集成测试于 `tests/integration/account-agent-create.test.ts`（002 session 复用）

### Implementation for User Story 1

- [ ] T051 [P] [US1] 创建 AgentCreate / AgentUpdate / AgentListItem / AgentDetail DTO 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/dto/AgentDtos.java`
- [ ] T052 [P] [US1] 创建 ToolConfig / ToolConfigUpdate DTO 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/dto/ToolConfigDtos.java`
- [ ] T053 [P] [US1] 创建 SandboxConstraint / SandboxConstraintUpdate DTO 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/dto/SandboxConstraintDtos.java`
- [ ] T054 [US1] 实现 AgentService CRUD 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentService.java`（create / get / update / list / delete；私有 ACL 抛 NotFoundException；**create/update 时调 `AgentScopeFactory.build(entity)` 真实实例化 ReActAgent 并注册到 `RuntimeRegistry`，失败回写 `runtimeStatus=FAILED` 与 `runtimeMessage`**）
- [ ] T055 [US1] 实现 ToolConfigService 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/ToolConfigService.java`（get / update，version 自增，UPDATE 事件含工具差异）
- [ ] T056 [US1] 实现 SandboxConstraintService 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/SandboxConstraintService.java`（get / update，UPDATE 事件含沙箱差异）
- [ ] T057 [US1] 实现 AgentController 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/AgentController.java`（`GET /api/agents` / `POST /api/agents` / `GET /api/agents/{id}` / `PUT /api/agents/{id}`）
- [ ] T058 [US1] 实现工具与沙箱子控制器于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/AgentConfigController.java`（`GET/PUT /api/agents/{id}/tool-config` 与 `/sandbox-constraint`）
- [ ] T059 [US1] 实现 CREATED 事件落库于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentEventService.java`（含工具与沙箱配置快照）
- [ ] T060 [US1] 实现 UPDATED 事件落库于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentEventService.java`（diff 摘要）
- [ ] T061 [P] [US1] 创建前端 API 客户端于 `bbird-hive-web/lib/api/agents.ts`（list / create / get / update + 类型定义）
- [ ] T062 [P] [US1] 创建前端工具配置客户端于 `bbird-hive-web/lib/api/toolConfig.ts`（基于 `agent-config.schema.json` 校验）
- [ ] T063 [P] [US1] 创建前端沙箱约束客户端于 `bbird-hive-web/lib/api/sandboxConstraint.ts`（基于 `agent-config.schema.json` 校验）
- [ ] T064 [P] [US1] 创建前端 AgentForm 组件于 `bbird-hive-web/components/agents/AgentForm.tsx`（name / role / capability 必填 + 错误提示）
- [ ] T065 [P] [US1] 创建前端 ToolConfigEditor 组件于 `bbird-hive-web/components/agents/ToolConfigEditor.tsx`（allowList / denyList 切换 + JSON 实时校验 + 100 项上限提示）
- [ ] T066 [P] [US1] 创建前端 SandboxConstraintEditor 组件于 `bbird-hive-web/components/sandbox/SandboxConstraintEditor.tsx`（fsAllowList 绝对路径校验 + timeouts 滑块）
- [ ] T067 [P] [US1] 创建前端 AgentCard 组件于 `bbird-hive-web/components/agents/AgentCard.tsx`（列表项卡片：name / role / status / updatedAt）
- [ ] T068 [US1] 创建前端 `/agents` 列表页于 `bbird-hive-web/app/agents/page.tsx`（搜索框 + 状态过滤 + "+ 新建" 按钮）
- [ ] T069 [US1] 创建前端 `/agents/new` 创建页于 `bbird-hive-web/app/agents/new/page.tsx`（复用 AgentForm）
- [ ] T070 [US1] 创建前端 `/agents/[id]` 编辑页于 `bbird-hive-web/app/agents/[id]/page.tsx`（加载详情 + 复用 AgentForm + 工具/沙箱子编辑器）
- [ ] T071 [US1] 在 `bbird-hive-web/app/agents/page.tsx` 接入 002 收口的 `AuthedShell` / `PageHeader` 壳层
- [ ] T072 [US1] 在前端 API 客户端中加入 401 自动跳转登录于 `bbird-hive-web/lib/api/agents.ts`（拦截器）

**Checkpoint**: US1 完整可独立验收；普通用户可创建/查看/编辑自己的智能体（含工具 + 沙箱）；他人访问 404。

---

## Phase 4: User Story 2 - 普通用户删除自己的智能体 (Priority: P2)

**Goal**: 普通用户能删除自己未被引用的智能体；被 004 / 005 引用的智能体必须先"取消引用"（`force=true`）。

**Independent Test**: 用户删除一个未被引用的智能体成功；用户删除被引用的智能体（`force=false`）返回 409 + 引用方列表；用户用 `force=true` 删除后引用方保留 `agentDeleted=true` 软标记。

### Tests for User Story 2

- [ ] T073 [P] [US2] 创建删除契约测试于 `tests/contract/agents/delete-agent.contract.test.ts`（204 / 409 / `force=true` 204）
- [ ] T074 [P] [US2] 创建 AgentService 删除单元测试于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/AgentDeleteServiceTest.java`（未引用 / 被引用 / force / 404）
- [ ] T075 [P] [US2] 创建前端 DeleteAgentDialog 组件测试于 `bbird-hive-web/tests/agents/delete-agent-dialog.spec.tsx`（引用列表展示 + force 二次确认）
- [ ] T076 [P] [US2] 创建跨服务引用探测集成测试于 `tests/integration/account-agent-private-acl.test.ts`（mock 004/005 read-only API）

### Implementation for User Story 2

- [ ] T077 [P] [US2] 创建 AgentReference 探测 DTO 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/dto/AgentReferenceDtos.java`（`type: chat_session | demand` / `id` / `title` / `referencedAt`）
- [ ] T078 [P] [US2] 创建引用探测 Feign 客户端于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/integration/ReferenceClient.java`（调用 004/005 的 read-only API：`GET /api/internal/agents/{id}/references`）
- [ ] T079 [P] [US2] 创建跨服务软标记 Feign 客户端于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/integration/ReferenceMutateClient.java`（`POST /api/internal/agents/{id}/mark-deleted`，agent-service 在 force 删除后调用）
- [ ] T080 [US2] 在 AgentService 实现 delete + force 逻辑于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentService.java`（未引用直接物理删除 + 写 `DELETED` 事件；被引用 + `force=true` → 调用 mark-deleted 后物理删除；被引用 + `force=false` → 抛 `AgentReferencedException(409, 引用方列表)`）
- [ ] T081 [US2] 在 AgentController 暴露 DELETE 与 force 查询参数于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/AgentController.java`（`DELETE /api/agents/{id}?force=...`）
- [ ] T082 [US2] 在 AgentEventService 实现 DELETED 事件落库于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentEventService.java`（含 force 标记）
- [ ] T083 [P] [US2] 创建前端 DeleteAgentDialog 组件于 `bbird-hive-web/components/agents/DeleteAgentDialog.tsx`（未引用直接确认；被引用展示列表 + "取消引用并删除" 勾选）
- [ ] T084 [US2] 在 AgentCard 接入删除按钮于 `bbird-hive-web/components/agents/AgentCard.tsx`（打开 DeleteAgentDialog）
- [ ] T085 [US2] 在前端 API 客户端实现 delete 于 `bbird-hive-web/lib/api/agents.ts`（带 force 参数 + 409 解析引用方列表）
- [ ] T086 [US2] 创建错误响应解析工具于 `bbird-hive-web/lib/api/errors.ts`（把后端 `fieldErrors` 映射到表单字段）

**Checkpoint**: US2 完整可独立验收；用户删除智能体时被引用场景行为正确；引用方软标记数据落库。

---

## Phase 5: User Story 3 - 管理员查看/停用/恢复智能体 (Priority: P3)

**Goal**: 管理员能跨用户查询所有智能体（按创建人 / 状态 / 停用原因过滤），对违规智能体执行停用（必填原因），对误停智能体执行恢复（必填原因）。

**Independent Test**: 管理员搜索任一智能体能查到创建用户与状态；对违规智能体点停用并填原因后，普通用户在自己的列表中也能看到 `DISABLED` 状态；管理员恢复后重新可用；非管理员调用管理端返回 403。

### Tests for User Story 3

- [ ] T087 [P] [US3] 创建管理员列表契约测试于 `tests/contract/agents/admin-list-agents.contract.test.ts`（按 createdByUserId / status / disabledReason 过滤 + 分页）
- [ ] T088 [P] [US3] 创建停用契约测试于 `tests/contract/agents/disable-agent.contract.test.ts`（必填 reason / 非 admin 403）
- [ ] T089 [P] [US3] 创建恢复契约测试于 `tests/contract/agents/restore-agent.contract.test.ts`（必填 reason / 状态机合法性）
- [ ] T090 [P] [US3] 创建 AgentAdminService 单元测试于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/AgentAdminServiceTest.java`（disable / restore / 状态机拒绝）
- [ ] T091 [P] [US3] 创建前端 AdminAgentList 页面测试于 `bbird-hive-web/tests/agents/admin-agent-list.spec.tsx`（三过滤器 + 行操作）
- [ ] T092 [P] [US3] 创建前端 DisableAgentDialog / RestoreAgentDialog 组件测试于 `bbird-hive-web/tests/agents/disable-restore-dialog.spec.tsx`（reason 必填）
- [ ] T093 [P] [US3] 创建跨服务 admin 鉴权集成测试于 `tests/integration/account-agent-disable.test.ts`（admin 角色穿透 + 普通用户被拒）

### Implementation for User Story 3

- [ ] T094 [P] [US3] 创建 AgentAdmin DTO 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/dto/AgentAdminDtos.java`（DisableRequest / RestoreRequest / AdminAgentListItem）
- [ ] T095 [US3] 实现 AgentAdminService 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentAdminService.java`（list / disable / restore，状态机校验 ACTIVE→DISABLED / DISABLED→ACTIVE，写审计）
- [ ] T096 [US3] 实现 AdminAgentController 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/AdminAgentController.java`（`GET /api/admin/agents` / `POST /api/admin/agents/{id}/disable` / `POST /api/admin/agents/{id}/restore`）
- [ ] T097 [US3] 在 SecurityConfig 接入 `/api/admin/**` 路径的 `requireAdmin` 保护于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/SecurityConfig.java`
- [ ] T098 [US3] 在 AgentEventService 实现 DISABLED_BY_ADMIN 事件落库于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentEventService.java`（含 disabledByAdminId / reason）
- [ ] T099 [US3] 在 AgentEventService 实现 RESTORED_BY_ADMIN 事件落库于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentEventService.java`（含 restoredByAdminId / reason）
- [ ] T100 [US3] 在 AgentService.list / get 中应用 `ACTIVE` 优先策略于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentService.java`（owner 视角可看到自己 `DISABLED` 的智能体；admin 视角展示全部）
- [ ] T101 [P] [US3] 创建前端 admin API 客户端于 `bbird-hive-web/lib/api/adminAgents.ts`（list / disable / restore）
- [ ] T102 [P] [US3] 创建前端 DisableAgentDialog 组件于 `bbird-hive-web/components/agents/DisableAgentDialog.tsx`（reason 必填 + 1-500 字符）
- [ ] T103 [P] [US3] 创建前端 RestoreAgentDialog 组件于 `bbird-hive-web/components/agents/RestoreAgentDialog.tsx`（reason 必填）
- [ ] T104 [P] [US3] 创建前端 AdminAgentCard 组件于 `bbird-hive-web/components/agents/AdminAgentCard.tsx`（展示创建用户 / 状态 / 停用原因 / 操作按钮）
- [ ] T105 [US3] 创建前端 `/admin/agents` 列表页于 `bbird-hive-web/app/admin/agents/page.tsx`（三过滤器 + 列表 + 行操作）
- [ ] T106 [US3] 创建前端 `/admin/agents/[id]` 详情页于 `bbird-hive-web/app/admin/agents/[id]/page.tsx`（配置快照 + 停用/恢复入口 + 事件流）
- [ ] T107 [US3] 在 `bbird-hive-web/app/admin/agents/page.tsx` 接入 002 收口的 `AuthedShell` / `PageHeader` 壳层

**Checkpoint**: US3 完整可独立验收；管理员可跨用户查询与治理智能体；普通用户调用管理端 403。

---

## Phase 6: 工具白/黑名单 + 沙箱约束 跨服务契约（FR-009）

**Purpose**: 把 `contracts/agent-config.schema.json` 作为 003 ↔ 007 共享契约，007 启动智能体时按此 schema 只读读取。

**说明**: 本阶段非独立用户故事，是 FR-009 的契约收口；其校验器与编辑器已在 US1 / US2 / US3 中实现，本阶段只做"契约稳定性 + 文档 + 007 接入指引"。

- [ ] T108 [P] 契约 schema 双源校验在 backend 启动时加载并断言版本号于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/config/AgentConfigSchemaLoader.java`（与 `lib/api/toolConfig.ts` 的 `SCHEMA_VERSION` 一致）
- [ ] T109 [P] 契约 schema 双源校验在前端启动时加载并断言版本号于 `bbird-hive-web/lib/api/toolConfig.ts`（`SCHEMA_VERSION` 常量导出）
- [ ] T110 [P] 编写 003 ↔ 007 跨服务契约说明于 `specs/003-agent-management/contracts/README.md`（schema 字段含义、007 启动时只读读取、schema 变更需双方同步）
- [ ] T111 [P] 编写契约版本兼容策略于 `specs/003-agent-management/contracts/VERSIONING.md`（major.minor 双轨，007 端 schema 校验失败时降级到空集 + warning 日志）

**Checkpoint**: 003 端工具与沙箱配置以统一 schema 持久化与校验，007 接入材料就绪。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 部署、可观测、契约测试、端到端验证、文档收口。

- [ ] T112 [P] 完善 Docker 镜像构建于 `deploy/docker/agent-service.Dockerfile`（多阶段 + JRE 21 基础镜像 + 健康检查）
- [ ] T113 [P] 完善 Docker 构建脚本于 `deploy/docker/build-agent-service.sh`（含镜像标签与本地推送）
- [ ] T114 [P] 完善 Kubernetes 部署清单于 `deploy/k8s/agent-service.yaml`（Deployment + Service + ConfigMap + HPA + readiness/liveness probe）
- [ ] T115 [P] 完善 Podman 本地依赖说明于 `deploy/podman/agent-dependencies.md`（含 agent-service 启动命令）
- [ ] T116 [P] 配置 actuator 端点（health / info / prometheus）于 `bbird-hive-server/services/agent-service/src/main/resources/application.yml`
- [ ] T117 [P] 实现跨服务 requestId 链路透传（agent-service 入口生成 + 出口传递）于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/RequestIdFilter.java`
- [ ] T118 [P] 编写 quickstart.md 端到端验证脚本于 `specs/003-agent-management/quickstart.md`（本地启动 + curl 验证 + 删除引用测试 + 跨服务 admin disable）
- [ ] T119 [P] 跑通 OpenAPI 全量契约测试套件于 `tests/contract/agents/`（8 个端点：list / create / get / update / delete / tool-config / sandbox-constraint / admin-*）
- [ ] T120 [P] 跑通跨服务集成测试套件于 `tests/integration/`（3 个：account-agent-create / account-agent-disable / account-agent-private-acl）
- [ ] T121 [P] 跑通后端单元测试套件于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/`（≥4 个：AgentService / AgentAdminService / ToolConfigValidator / SandboxConstraintValidator）
- [ ] T122 [P] 跑通前端组件 + 流程测试套件于 `bbird-hive-web/tests/agents/`（≥6 个：AgentForm / AgentCard / DeleteDialog / DisableDialog / RestoreDialog / ToolConfigEditor / SandboxConstraintEditor）
- [ ] T123 [P] 创建 4 主题需求质量 checklist 于 `specs/003-agent-management/checklists/requirements.md`（参照 002 收口的 4 主题模板）
- [ ] T124 [P] 跑通 `/speckit-analyze` 跨 spec/plan/tasks 一致性扫描并收口报告于 `specs/003-agent-management/analyze-report.md`
- [ ] T125 [P] 编写 verification.md 收口于 `specs/003-agent-management/verification.md`（实现完成度 + 已知 Gap + 宪法符合性）
- [ ] T126 [P] 更新 START_HERE.md 标记本 feature 已收口于 `specs/003-agent-management/START_HERE.md`
- [ ] T127 [P] 合并 003 分支到 main 并删除 feature 分支（按宪法治理）

**Checkpoint**: 003-agent-management 全量收口，可对接 004 / 005 / 007。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，立即可启动
- **Foundational (Phase 2)**: 依赖 Phase 1 完成 — **阻塞所有用户故事**
- **User Stories (Phase 3-5)**: 依赖 Phase 2 完成；故事间相互独立可并行
- **工具/沙箱契约 (Phase 6)**: 依赖 Phase 3 完成（schema 已在 US1 中落地）
- **Polish (Phase 7)**: 依赖所有用户故事与 Phase 6 完成

### User Story Dependencies

- **US1 (P1)**: Phase 2 完成后可启动；不依赖其他故事 → **MVP 入口**
- **US2 (P2)**: Phase 2 完成后可启动；与 US1 共享 AgentService 但不依赖 US1 的 UI
- **US3 (P3)**: Phase 2 完成后可启动；与 US1 共享 AgentService 但不依赖 US1 的 UI

### Within Each User Story

- Tests 在 Implementation 之前；tests 先写并确认失败
- DTO 在 Service 之前；Service 在 Controller 之前
- 前端 API 客户端在页面之前；通用组件在页面之前
- 审计事件与权限拦截在端点暴露之前
- 容器化与可观测在端到端验证之前

### Parallel Opportunities

- Phase 1 全部 [P] 任务可并行（Maven、源码目录、前端目录、Dockerfile 等不同文件）
- Phase 2 的实体 / 枚举 / Mapper [P] 任务可并行（不同文件）
- 各用户故事的 Tests 子阶段 [P] 任务可并行
- 各用户故事的 Implementation 子阶段 [P] 任务可并行（不同 DTO / 组件）
- US1 / US2 / US3 三个用户故事由不同开发人员并行推进

---

## Parallel Example: User Story 1

```bash
# 一同启动 US1 的所有契约测试（不同文件）
Task: "创建列表契约测试于 tests/contract/agents/list-agents.contract.test.ts"
Task: "创建创建契约测试于 tests/contract/agents/create-agent.contract.test.ts"
Task: "创建详情契约测试于 tests/contract/agents/get-agent.contract.test.ts"
Task: "创建编辑契约测试于 tests/contract/agents/update-agent.contract.test.ts"

# 一同启动 US1 的所有 DTO（不同文件）
Task: "创建 AgentCreate / AgentUpdate / AgentListItem / AgentDetail DTO"
Task: "创建 ToolConfig / ToolConfigUpdate DTO"
Task: "创建 SandboxConstraint / SandboxConstraintUpdate DTO"

# 一同启动 US1 的所有前端组件（不同文件）
Task: "创建前端 AgentForm 组件"
Task: "创建前端 ToolConfigEditor 组件"
Task: "创建前端 SandboxConstraintEditor 组件"
Task: "创建前端 AgentCard 组件"
```

---

## Implementation Strategy

### MVP First（仅 US1）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（**关键** — 阻塞所有故事）
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 独立测试 US1（创建 → 列表 → 编辑 → 工具/沙箱 → 私有 ACL 404）
5. 部署 / 演示（如就绪）

### Incremental Delivery

1. Setup + Foundational → 基础设施就绪
2. + US1 → 独立测试 → 部署 / 演示（**MVP！**）
3. + US2 → 独立测试 → 部署 / 演示
4. + US3 → 独立测试 → 部署 / 演示
5. + Phase 6 契约 + Phase 7 收口 → 003 收口，可对接 004 / 005 / 007

### Parallel Team Strategy（多开发人员）

1. 团队共同完成 Setup + Foundational
2. Foundational 一旦完成：
   - 开发者 A：US1（P1）— 智能体 CRUD + 工具/沙箱编辑器
   - 开发者 B：US2（P2）— 删除与 force 引用
   - 开发者 C：US3（P3）— 管理员停用/恢复
3. Phase 6 / Phase 7 由任一开发者收口
4. 故事完成且独立可集成

---

## Notes

- [P] 任务 = 不同文件，无相互依赖
- [Story] 标签映射任务到具体用户故事以便追踪
- 每个用户故事应可独立完成与测试
- 实现前先验证测试失败
- 每个任务或逻辑组完成后提交
- 在任何 checkpoint 停下以独立验证故事
- 部署行为变化时验证 Docker / Kubernetes / Podman 假设
- **私有 ACL** 在所有故事中保持一致：他人访问智能体 ID → 404（不暴露存在性）
- **雪花 ID** 在所有主外键保持一致：`Long` 主键 + JSON 字符串序列化
- **session 鉴权** 在所有端点保持一致：复用 002 收口的 `BBIRD_SESSION` cookie 与 `AuthorizationService`
- 避免：模糊任务、同文件冲突、跨故事依赖破坏独立性


---

## Phase 8: AgentScope 2.0 集成（追加）

**Purpose**: 把 AgentScope 2.0 Java SDK 接入 agent-service，使 003 真正通过 `ReActAgent.builder()...build()` 创建可运行的智能体，暴露 smoke test 与 runtime 端点给 007 复用。

**说明**: 本阶段在 spec-kit 流程收口后追加，回应"没看到 agent 真实创建过程"的反馈。Phase 1-7 任务保持不变；本阶段任务 T128-T150 全部为新增。

### Foundational: AgentScope 2.0 启动基础

- [ ] T128 [P] 配置 AgentScope 2.0 Maven 依赖（`io.agentscope:agentscope-core:2.0.0-RC1`）于 `bbird-hive-server/services/agent-service/pom.xml`，锁定 `agentscope.version=2.0.0-RC1` 父属性
- [ ] T129 [P] 创建 `AgentScopeConfig` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/AgentScopeConfig.java`（注册 `ModelRegistry` bean、共享 `Toolkit` bean、`@Value("${agentscope.default-model: dashscope:qwen-plus}")`）
- [ ] T130 创建 `AgentScopeFactory` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/runtime/AgentScopeFactory.java`（提供 `ReActAgent build(AgentEntity, ToolConfigEntity)` / `void close(ReActAgent)` API；把 `capability` 翻译为 `sysPrompt`、把 `toolConfig.allowList` 反射注册到 `Toolkit`、`model` 字符串 id 走 `ModelRegistry`）
- [ ] T131 [P] 创建 `RuntimeRegistry` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/runtime/RuntimeRegistry.java`（in-memory `ConcurrentHashMap<Long, ReActAgent>`；提供 `register / get / remove / rebuild / deactivate / restore` API；线程安全）
- [ ] T132 [P] 创建 `RuntimeRegistryBootstrap` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/runtime/RuntimeRegistryBootstrap.java`（`@EventListener(ApplicationReadyEvent.class)` 扫 `status=ACTIVE AND runtimeStatus IN (NOT_READY, FAILED)` 的智能体逐个 `factory.build()` rebuild，写回 `runtimeStatus` 与 `runtimeMessage`，打 Prometheus 指标）
- [ ] T133 [P] 创建 `AgentScopeHealthIndicator` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/runtime/AgentScopeHealthIndicator.java`（`/actuator/health/agentscope` 端点，校验 `ModelRegistry` 解析默认 model + `RuntimeRegistry` size）

### Tests for AgentScope 集成

- [ ] T134 [P] [US1] 契约测试 smoke test 端点于 `tests/contract/agents/smoke-test.contract.test.ts`（发 `UserMessage` → 200 + `SmokeTestResponse`）
- [ ] T135 [P] [US1] 契约测试 runtime 端点于 `tests/contract/agents/agent-runtime.contract.test.ts`（GET `/agents/{id}/runtime` + GET `/internal/agents/{id}/runtime`）
- [ ] T136 [P] [US1] 单元测试 `AgentScopeFactory` 于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/runtime/AgentScopeFactoryTest.java`（build 成功 / 模型解析失败 / tool 注册失败）
- [ ] T137 [P] [US1] 单元测试 `RuntimeRegistry` 于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/runtime/RuntimeRegistryTest.java`（register/remove/rebuild/线程安全）
- [ ] T138 [P] [US1] 单元测试 `AgentScopeHealthIndicator` 于 `bbird-hive-server/services/agent-service/src/test/java/com/bbird/agent/service/runtime/AgentScopeHealthIndicatorTest.java`
- [ ] T139 [P] [US1] 前端 `ModelSelector` 组件测试于 `bbird-hive-web/tests/agents/model-selector.spec.tsx`（dashscope/openai/anthropic/gemini/ollama 切换）
- [ ] T140 [P] [US1] 前端 `RuntimeStatusBadge` 组件测试于 `bbird-hive-web/tests/agents/runtime-status-badge.spec.tsx`（NOT_READY 灰 / READY 绿 / FAILED 红）
- [ ] T141 [P] [US1] 前端 `SmokeTestPanel` 组件测试于 `bbird-hive-web/tests/agents/smoke-test-panel.spec.tsx`（按钮触发 / loading / 显示回复与 tool 调用）
- [ ] T142 [P] [US1] 集成测试 `account-agent-rebuild` 于 `tests/integration/account-agent-rebuild.test.ts`（创建 agent → 重启 service → 验证 `RuntimeRegistryBootstrap` rebuild 成功）

### Implementation for AgentScope 集成

- [ ] T143 [P] [US1] 创建 `SmokeTestRequest` / `SmokeTestResponse` / `AgentRuntime` DTO 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/dto/AgentRuntimeDtos.java`
- [ ] T144 [US1] 实现 `AgentScopeFactory.build()` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/runtime/AgentScopeFactory.java`（核心：`ReActAgent.builder().name(entity.getName()).sysPrompt(entity.getCapability()).model(entity.getModel()).toolkit(buildToolkit(toolConfig)).build()`；捕获 model 解析异常并包装为 `AgentScopeBuildException`）
- [ ] T145 [US1] 实现 `RuntimeRegistry` 完整 API 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/runtime/RuntimeRegistry.java`（`register` / `get` / `remove + close` / `rebuild` / `deactivate` / `restore`；每个方法打 debug log）
- [ ] T146 [US1] 实现 `AgentRuntimeController` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/api/AgentRuntimeController.java`（`POST /api/agents/{id}/test` smoke test / `GET /api/agents/{id}/runtime` owner 视角 / `GET /api/internal/agents/{id}/runtime` 007 视角 mTLS）
- [ ] T147 [P] [US1] 创建前端 `ModelSelector` 组件于 `bbird-hive-web/components/agents/ModelSelector.tsx`（下拉：dashscope:qwen-plus / openai:gpt-4 / openai:gpt-4o / anthropic:claude-sonnet-4-5 / gemini:gemini-2.0-flash / ollama:llama3；provider 自动派生）
- [ ] T148 [P] [US1] 创建前端 `RuntimeStatusBadge` 组件于 `bbird-hive-web/components/agents/RuntimeStatusBadge.tsx`（`NOT_READY` 灰 + 文案"未实例化" / `READY` 绿 + "可运行" / `FAILED` 红 + 悬浮显示 `runtimeMessage`）
- [ ] T149 [P] [US1] 创建前端 `SmokeTestPanel` 组件于 `bbird-hive-web/components/agents/SmokeTestPanel.tsx`（输入 prompt → POST `/api/agents/{id}/test` → 显示回复与耗时；可重试）
- [ ] T150 [US1] 在 `/agents/[id]` 详情页接入 smoke test 按钮于 `bbird-hive-web/app/agents/[id]/page.tsx`（AgentForm 旁加 "测试运行" 按钮 → 打开 `SmokeTestPanel`）
- [ ] T151 [P] [US1] 在 `AgentForm` 表单接入 `ModelSelector` 于 `bbird-hive-web/components/agents/AgentForm.tsx`（创建/编辑都可切换 model）
- [ ] T152 [P] [US1] 在 `AgentCard` 列表项接入 `RuntimeStatusBadge` 于 `bbird-hive-web/components/agents/AgentCard.tsx`（列表显示 runtime 状态）
- [ ] T153 [P] [US1] 创建前端 runtime API 客户端于 `bbird-hive-web/lib/api/runtime.ts`（`smokeTest` / `getRuntime` 类型与调用）
- [ ] T154 [US1] 在 `AgentService.create/update` 调用 `factory.build()` + `registry.register()` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentService.java`（失败回写 `runtimeStatus=FAILED` + `runtimeMessage` + 写 `AgentEvent`)
- [ ] T155 [US1] 在 `AgentService.delete` 调用 `registry.remove(agentId)` + `reActAgent.close()` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentService.java`（释放资源）
- [ ] T156 [US1] 在 `AgentAdminService.disable / restore` 接入 `registry.deactivate / restore` 于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/service/AgentAdminService.java`（停用关闭实例 + 从 registry 移除；恢复时 rebuild）

### 003 ↔ 007 跨服务契约收口

- [ ] T157 [P] 编写 003 ↔ 007 internal runtime 契约说明于 `specs/003-agent-management/contracts/internal-agent-runtime.md`（`GET /api/internal/agents/{id}/runtime` 返回 schema + mTLS 鉴权 + 007 端集成方式）
- [ ] T158 [P] 在 `SecurityConfig` 放行 `/api/internal/**` 路径于 `bbird-hive-server/services/agent-service/src/main/java/com/bbird/agent/config/SecurityConfig.java`（不需 session 鉴权；mTLS / service token 由基础设施层处理）

### Polish

- [ ] T159 [P] quickstart.md 加 "测试 agent 是否可运行" 章节于 `specs/003-agent-management/quickstart.md`（curl 调用 smoke test 端点 + 预期响应）
- [ ] T160 [P] 端到端验证脚本于 `specs/003-agent-management/quickstart.md`（创建 → smoke test → 编辑 model → 二次 smoke test → 停用 → 验证 runtime=CLOSED）
- [ ] T161 [P] 更新 plan.md 标记 AgentScope 集成已完成于 `specs/003-agent-management/plan.md`（在 Post-Design Constitution Check 加 003↔007 边界已落地条目）

**Checkpoint**: AgentScope 2.0 真实创建闭环 —— 用户创建智能体后立即可调 `POST /api/agents/{id}/test` 验证；runtime status 在 `READY` 时 007 可拉取 runtime 元数据开始多轮会话。

---

## Notes（追加）

- T128-T161 是 AgentScope 2.0 集成新增任务，与 Phase 1-7 的 T001-T127 并行存在
- AgentScope 入口选型：`ReActAgent`（agentscope-core）—— 若需升级到 `HarnessAgent`（workspace/memory/sandbox），把 T130 改为 `HarnessAgent.builder()` + 加 `workspace` / `filesystem` 即可，API 形态相似
- 003 ↔ 007 边界：003 收口「agent 创建 + runtime 状态 + smoke test」；007 收口「多轮会话 + 流式输出 + 长期 state」—— 007 不再自行实例化 agent
- 性能目标：smoke test P95 < 5 秒（含 LLM 推理）；RuntimeRegistry rebuild 启动期间增量执行
