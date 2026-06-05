# Tasks: 账号认证与平台角色

**Input**: Design documents from `specs/002-account-auth/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: 本 feature 涉及账号、密码、会话、权限和审计，按宪法质量门禁生成单元测试、契约测试和集成测试任务。

**Organization**: 任务按用户故事分组，确保每个故事可以独立实现、测试和验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行，且不会修改同一文件或依赖未完成任务。
- **[Story]**: 用户故事阶段任务必须标注，例如 `[US1]`。
- 每个任务描述都包含明确文件路径。

## Phase 1: Setup

**Purpose**: 初始化后端 Maven 服务、前端 Next.js 应用、部署目录和共享约定。

- [X] T001 创建后端认证服务 Maven 项目骨架于 `backend/services/auth-service/pom.xml`
- [X] T002 [P] 创建后端源码目录结构于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/`
- [X] T003 [P] 创建后端测试目录结构于 `backend/services/auth-service/src/test/java/com/myagentscope/auth/`
- [X] T004 创建前端 Next.js 应用包配置于 `frontend/apps/web/package.json`
- [X] T005 [P] 创建前端 App Router 目录结构于 `frontend/apps/web/app/`
- [X] T006 [P] 创建前端 AI chat 预留目录于 `frontend/apps/web/components/chat/` 和 `frontend/apps/web/lib/ai/`
- [X] T007 创建本地配置样例于 `backend/services/auth-service/src/main/resources/application-local.yml`
- [X] T008 [P] 创建 Docker 构建文件于 `deploy/docker/auth-service.Dockerfile`
- [X] T009 [P] 创建 Kubernetes 部署占位清单于 `deploy/k8s/auth-service.yaml`
- [X] T010 [P] 创建 Podman 本地依赖说明于 `deploy/podman/auth-dependencies.md`

---

## Phase 2: Foundational

**Purpose**: 完成所有用户故事共享的实体、数据库、Redis、鉴权、异常和审计基础。

**Critical**: 本阶段完成前不得开始用户故事实现。

- [X] T011 配置 Maven 依赖于 `backend/services/auth-service/pom.xml`，包含 Spring Boot、Spring Security、MyBatis-Plus、MySQL、Redis、测试依赖
- [X] T012 [P] 创建用户实体类于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/domain/UserEntity.java`
- [X] T013 [P] 创建密码凭据实体类于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/domain/PasswordCredentialEntity.java`
- [X] T014 [P] 创建会话摘要实体类于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/domain/SessionEntity.java`
- [X] T015 [P] 创建访问事件实体类于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/domain/AccessEventEntity.java`
- [X] T016 [P] 创建平台角色枚举于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/domain/PlatformRole.java`
- [X] T017 [P] 创建账号状态枚举于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/domain/UserStatus.java`
- [X] T018 [P] 创建访问事件类型枚举于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/domain/AccessEventType.java`
- [X] T019 创建 MySQL 迁移脚本于 `backend/services/auth-service/src/main/resources/db/migration/V001__create_auth_tables.sql`
- [X] T020 创建 MyBatis-Plus 用户 Mapper 于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/mapper/UserMapper.java`
- [X] T021 [P] 创建 MyBatis-Plus 密码凭据 Mapper 于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/mapper/PasswordCredentialMapper.java`
- [X] T022 [P] 创建 MyBatis-Plus 会话摘要 Mapper 于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/mapper/SessionMapper.java`
- [X] T023 [P] 创建 MyBatis-Plus 访问事件 Mapper 于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/mapper/AccessEventMapper.java`
- [X] T024 创建 Redis 会话配置于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/config/RedisSessionConfig.java`
- [X] T025 创建 Spring Security 基础配置于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/config/SecurityConfig.java`
- [X] T026 创建统一异常模型于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/ErrorResponse.java`
- [X] T027 创建审计事件服务于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/AccessEventService.java`
- [X] T028 创建密码哈希与初始密码生成服务于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/PasswordService.java`
- [X] T029 [P] 创建后端测试基础配置于 `backend/services/auth-service/src/test/java/com/myagentscope/auth/support/AuthServiceTestConfig.java`
- [X] T030 [P] 创建前端 API 客户端基础封装于 `frontend/apps/web/lib/api/client.ts`
- [X] T031 [P] 创建前端用户会话状态封装于 `frontend/apps/web/lib/api/session.ts`

**Checkpoint**: 基础实体、数据库、Redis、鉴权和审计能力可供各用户故事复用。

---

## Phase 3: User Story 1 - 用户登录平台 (Priority: P1)

**Goal**: 普通用户和管理员能使用用户名 + 密码登录，并进入各自可访问区域。

**Independent Test**: 使用普通用户和管理员账号分别登录，普通用户进入工作空间，管理员进入管理端入口；错误密码被拒绝并记录事件。

### Tests for User Story 1

- [X] T032 [P] [US1] 创建登录接口契约测试于 `tests/contract/auth/login.contract.test.ts`
- [X] T033 [P] [US1] 创建登录服务单元测试于 `backend/services/auth-service/src/test/java/com/myagentscope/auth/service/AuthServiceTest.java`
- [X] T034 [P] [US1] 创建登录页面流程测试于 `frontend/apps/web/tests/login.spec.ts`
- [X] T035 [P] [US1] 创建登录集成测试于 `tests/integration/account-auth-login.test.ts`

### Implementation for User Story 1

- [X] T036 [US1] 创建登录请求和响应 DTO 于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/dto/LoginDtos.java`
- [X] T037 [US1] 实现认证服务登录逻辑于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/AuthService.java`
- [X] T038 [US1] 实现会话创建和 Redis 写入逻辑于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/SessionService.java`
- [X] T039 [US1] 实现 `/auth/login`、`/auth/logout`、`/auth/me` 控制器于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/AuthController.java`
- [X] T040 [US1] 实现登录成功、登录失败和退出事件记录于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/AccessEventService.java`
- [X] T041 [US1] 创建前端登录页面于 `frontend/apps/web/app/login/page.tsx`
- [X] T042 [US1] 创建前端登录表单组件于 `frontend/apps/web/components/auth/LoginForm.tsx`
- [X] T043 [US1] 创建前端当前用户 API 调用于 `frontend/apps/web/lib/api/auth.ts`
- [X] T044 [US1] 创建普通用户工作空间入口页于 `frontend/apps/web/app/account/page.tsx`
- [X] T045 [US1] 创建管理员入口页于 `frontend/apps/web/app/admin/page.tsx`

**Checkpoint**: US1 可独立验收。

---

## Phase 4: User Story 2 - 平台区分普通用户与管理员 (Priority: P2)

**Goal**: 平台只维护普通用户和管理员两种角色，并按角色和资源归属控制访问范围。

**Independent Test**: 普通用户访问管理端被拒绝；管理员可访问管理端；权限拒绝事件被记录。

### Tests for User Story 2

- [X] T046 [P] [US2] 创建管理端访问契约测试于 `tests/contract/auth/admin-access.contract.test.ts`
- [X] T047 [P] [US2] 创建权限服务单元测试于 `backend/services/auth-service/src/test/java/com/myagentscope/auth/service/AuthorizationServiceTest.java`
- [X] T048 [P] [US2] 创建前端路由守卫测试于 `frontend/apps/web/tests/admin-access.spec.ts`
- [X] T049 [P] [US2] 创建权限拒绝集成测试于 `tests/integration/account-auth-authorization.test.ts`

### Implementation for User Story 2

- [X] T050 [US2] 实现权限服务于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/AuthorizationService.java`
- [X] T051 [US2] 在安全配置中接入管理员路径保护于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/config/SecurityConfig.java`
- [X] T052 [US2] 实现权限拒绝事件记录于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/AccessEventService.java`
- [X] T053 [US2] 创建前端角色守卫工具于 `frontend/apps/web/lib/api/guards.ts`
- [X] T054 [US2] 在管理端页面接入普通用户拒绝访问提示于 `frontend/apps/web/app/admin/page.tsx`

**Checkpoint**: US2 可独立验收。

---

## Phase 5: User Story 3 - 管理员创建账号 (Priority: P3)

**Goal**: 管理员能创建普通用户或管理员账号，系统生成初始密码并只展示一次，普通用户不能自助注册。

**Independent Test**: 管理员创建账号后，新账号可登录；普通用户无法访问创建账号能力；重复用户名被拒绝。

### Tests for User Story 3

- [X] T055 [P] [US3] 创建管理员创建账号契约测试于 `tests/contract/auth/create-user.contract.test.ts`
- [X] T056 [P] [US3] 创建账号管理服务单元测试于 `backend/services/auth-service/src/test/java/com/myagentscope/auth/service/UserAdminServiceTest.java`
- [X] T057 [P] [US3] 创建管理员创建账号页面测试于 `frontend/apps/web/tests/admin-create-user.spec.ts`
- [X] T058 [P] [US3] 创建账号创建集成测试于 `tests/integration/account-auth-create-user.test.ts`

### Implementation for User Story 3

- [X] T059 [US3] 创建账号管理 DTO 于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/dto/UserAdminDtos.java`
- [X] T060 [US3] 实现账号管理服务于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/UserAdminService.java`
- [X] T061 [US3] 实现用户名唯一性校验于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/UserAdminService.java`
- [X] T062 [US3] 实现初始密码生成和一次性展示响应于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/UserAdminService.java`
- [X] T063 [US3] 实现 `/admin/users` 创建账号接口于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/AdminUserController.java`
- [X] T064 [US3] 创建管理员账号创建页面于 `frontend/apps/web/app/admin/users/new/page.tsx`
- [X] T065 [US3] 创建账号创建表单组件于 `frontend/apps/web/components/auth/CreateUserForm.tsx`
- [X] T066 [US3] 创建初始密码展示组件于 `frontend/apps/web/components/auth/InitialPasswordNotice.tsx`

**Checkpoint**: US3 可独立验收。

---

## Phase 6: User Story 4 - 修改和重置密码 (Priority: P4)

**Goal**: 普通用户可修改自己的密码，管理员可重置任意账号密码，新密码生效后旧密码失效。

**Independent Test**: 普通用户修改密码后旧密码不能登录；管理员重置密码后新初始密码可登录；普通用户不能修改他人密码。

### Tests for User Story 4

- [X] T067 [P] [US4] 创建修改密码契约测试于 `tests/contract/auth/change-password.contract.test.ts`
- [X] T068 [P] [US4] 创建重置密码契约测试于 `tests/contract/auth/reset-password.contract.test.ts`
- [X] T069 [P] [US4] 创建密码服务单元测试于 `backend/services/auth-service/src/test/java/com/myagentscope/auth/service/PasswordServiceTest.java`
- [X] T070 [P] [US4] 创建密码修改页面测试于 `frontend/apps/web/tests/change-password.spec.ts`
- [X] T071 [P] [US4] 创建密码修改和重置集成测试于 `tests/integration/account-auth-password.test.ts`

### Implementation for User Story 4

- [X] T072 [US4] 实现普通用户修改密码逻辑于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/PasswordService.java`
- [X] T073 [US4] 实现管理员重置密码逻辑于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/UserAdminService.java`
- [X] T074 [US4] 实现 `/auth/password` 修改密码接口于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/AuthController.java`
- [X] T075 [US4] 实现 `/admin/users/{userId}/password-reset` 重置密码接口于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/AdminUserController.java`
- [X] T076 [US4] 实现旧密码失效和密码变更事件记录于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/service/AccessEventService.java`
- [X] T077 [US4] 创建普通用户修改密码页面于 `frontend/apps/web/app/account/password/page.tsx`
- [X] T078 [US4] 创建修改密码表单组件于 `frontend/apps/web/components/auth/ChangePasswordForm.tsx`
- [X] T079 [US4] 创建管理员重置密码组件于 `frontend/apps/web/components/auth/ResetPasswordButton.tsx`

**Checkpoint**: US4 可独立验收。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 完成部署、审计查询、quickstart 验证和文档收尾。

- [X] T080 创建审计查询接口实现于 `backend/services/auth-service/src/main/java/com/myagentscope/auth/api/AdminAccessEventController.java`
- [X] T081 [P] 创建审计查询契约测试于 `tests/contract/auth/access-events.contract.test.ts`
- [X] T082 [P] 创建审计查询页面于 `frontend/apps/web/app/admin/access-events/page.tsx`
- [X] T083 [P] 创建前端 AI chat 预留组件占位于 `frontend/apps/web/components/chat/ChatShell.tsx`
- [X] T084 [P] 创建 Vercel AI SDK 预留封装于 `frontend/apps/web/lib/ai/runtime.ts`
- [X] T085 创建 Docker 镜像构建脚本于 `deploy/docker/build-auth-service.sh`
- [X] T086 创建 Kubernetes 服务和配置清单于 `deploy/k8s/auth-service.yaml`
- [X] T087 创建 Podman 本地启动脚本于 `deploy/podman/start-auth-dependencies.sh`
- [X] T088 更新 quickstart 验证说明于 `specs/002-account-auth/quickstart.md`
- [X] T089 运行后端测试并记录结果于 `specs/002-account-auth/verification.md`
- [X] T090 运行前端测试并记录结果于 `specs/002-account-auth/verification.md`
- [X] T091 运行契约和集成测试并记录结果于 `specs/002-account-auth/verification.md`

---


## Phase 8: 体验与基础设施修复

**Purpose**: 补齐原型对齐后发现的缺口（账号管理列表、退出按钮语义、雪花 ID）。

- [X] T092 [P] 新建后端 `GET /api/admin/users` 接口（admin 守卫），返回 `UserListItem` 列表。
- [X] T093 [P] 新建后端 `UserListItem` DTO（id/username/role/status/createdByAdminId/createdAt/lastLoginAt）。
- [X] T094 [P] 新建后端 `AccessEventDto` DTO，列表接口返回字符串形式的 ID。
- [X] T095 [P] 新建前端 `listUsers` / `updateUserStatus` API 封装于 `lib/api/auth.ts`。
- [X] T096 新建前端 `/admin/users` 列表页（统计行 + 角色筛选 + 行内重置/停用操作）。
- [X] T097 修正侧栏 `账号管理` 路由从 `/console?tab=admin-users` 改为 `/admin/users`。
- [X] T098 更新 `/admin` 入口页：增加 `账号管理` 入口卡片。
- [X] T099 新建 `components/shell/ProfileMenu.tsx`，把 top-right 头像改成下拉（个人设置 / 修改密码 / 退出登录），点空白与 Esc 关闭。
- [X] T100 [P] 新增 `IconLogout` 图标。
- [X] T101 [P] `app/styles.css` 补 `.menu` / `.menu-item` / `.menu-head` / `.menu-sep` / `.menu-danger` 样式。
- [X] T102 新增 V002 迁移：TRUNCATE 4 张表 + ALTER `id` / `user_id` / `actor_user_id` / `target_user_id` / `created_by_admin_id` / `changed_by_user_id` 为 `BIGINT`。
- [X] T103 实体类重构：`UserEntity` / `SessionEntity` / `PasswordCredentialEntity` / `AccessEventEntity` 全部 `String id` → `Long id`，`IdType.ASSIGN_UUID` → `IdType.ASSIGN_ID`。
- [X] T104 `SessionService` 改用雪花 ID（不再调用 `UUID.randomUUID()`），cookie 值与 Redis key 使用 `Long.toString`。
- [X] T105 `AuthService` / `UserAdminService` / `AccessEventService` / `AuthorizationService` 更新入参类型（`String` → `Long`）；DTO 在边界处 `String.valueOf`。
- [X] T106 `UserAdminService` 引入 `parseUserId(String)` 助手，校验路径参数为合法数字。
- [X] T107 `AdminAccessEventController` 改返回 `List<AccessEventDto>`，避免 Long 序列化为 JSON 数字。
- [X] T108 新增 `DataInitializer` (`CommandLineRunner`)，启动时若 `auth_user` 为空则种子 `admin / Admin123!`，雪花 ID 由 MP 自动生成。
- [X] T109 `data-model.md` 更新：所有 `id` / `userId` 字段类型由 `UUID` 改为 `Long (雪花)`，补充雪花 ID 在 API 层序列化为字符串的说明。
- [X] T110 `AuthorizationServiceTest` 修正：`setId("u1")` → `setId(1L)`。

**Checkpoint**: 三类修复（账号管理 UI / 头像下拉 / 雪花 ID）已落地且单测、契约、集成测试全过。

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 Setup 无依赖。
- Phase 2 Foundational 依赖 Phase 1 完成，并阻塞所有用户故事。
- Phase 3 US1 依赖 Phase 2，是 MVP 范围。
- Phase 4 US2 依赖 Phase 2，可在 US1 后实现，也可与 US1 后半段并行但必须共用会话基础。
- Phase 5 US3 依赖 Phase 2 和 US2 的管理员权限保护。
- Phase 6 US4 依赖 Phase 2、US1 的登录能力和 US3 的管理员账号管理能力。
- Phase 7 Polish 依赖目标用户故事完成。

### User Story Dependencies

- **US1 用户登录平台**: MVP，完成后用户可以登录、退出和获取当前用户信息。
- **US2 平台区分普通用户与管理员**: 可在 US1 后独立验收权限拒绝和管理端访问。
- **US3 管理员创建账号**: 依赖管理员权限保护，完成后新账号可进入 US1 登录流程。
- **US4 修改和重置密码**: 依赖登录和账号管理，完成后密码生命周期闭环。

### Within Each User Story

- 测试任务必须先于对应实现任务。
- 后端实体和 Mapper 必须先于服务。
- 服务必须先于 Controller。
- 前端 API 封装必须先于页面和组件接入。
- 每个故事完成后必须运行对应契约、单元、前端和集成测试。

## Parallel Opportunities

- T002、T003、T005、T006、T008、T009、T010 可并行。
- T012 到 T018 可并行创建实体和枚举。
- T021 到 T023 可与 T020 之后的不同 Mapper 并行。
- 每个用户故事的契约测试、后端单元测试、前端测试、集成测试可并行编写。
- US1 和 US2 的前端页面可在后端契约稳定后并行开发。
- Polish 阶段的 T081、T082、T083、T084 可并行。

## Parallel Example: User Story 1

```bash
Task: "T032 [P] [US1] 创建登录接口契约测试于 tests/contract/auth/login.contract.test.ts"
Task: "T033 [P] [US1] 创建登录服务单元测试于 backend/services/auth-service/src/test/java/com/myagentscope/auth/service/AuthServiceTest.java"
Task: "T034 [P] [US1] 创建登录页面流程测试于 frontend/apps/web/tests/login.spec.ts"
Task: "T035 [P] [US1] 创建登录集成测试于 tests/integration/account-auth-login.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T055 [P] [US3] 创建管理员创建账号契约测试于 tests/contract/auth/create-user.contract.test.ts"
Task: "T056 [P] [US3] 创建账号管理服务单元测试于 backend/services/auth-service/src/test/java/com/myagentscope/auth/service/UserAdminServiceTest.java"
Task: "T057 [P] [US3] 创建管理员创建账号页面测试于 frontend/apps/web/tests/admin-create-user.spec.ts"
Task: "T058 [P] [US3] 创建账号创建集成测试于 tests/integration/account-auth-create-user.test.ts"
```

## Implementation Strategy

### MVP First

先完成 Phase 1、Phase 2 和 US1。MVP 完成后，普通用户和管理员可以登录、退出、获取当前用户信息，登录失败会记录事件。

### Incremental Delivery

1. US1 登录平台。
2. US2 角色访问控制。
3. US3 管理员创建账号。
4. US4 修改和重置密码。
5. Polish 完成审计查询、部署和 quickstart 验证。

### Validation

- 每个用户故事完成后运行对应测试。
- 最终运行 `mvn test`、前端测试、契约测试和集成测试。
- 按 `specs/002-account-auth/quickstart.md` 验证本地 Podman、Docker 和 Kubernetes 路径。
