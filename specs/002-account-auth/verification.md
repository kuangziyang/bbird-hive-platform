# 验证记录：账号认证与平台角色

## 验证时间

- 2026-06-04 16:36 Asia/Shanghai（初版）
- 2026-06-05 11:50 Asia/Shanghai（视觉对齐后复核）
- 2026-06-05 15:02 Asia/Shanghai（账号管理 UI / 头像下拉 / 雪花 ID 重构后复核）

## 后端验证

- 命令：`mvn -U test`
- 路径：`bbird-hive-server/services/auth-service`
- 结果：通过
- 覆盖：`PasswordServiceTest`、`UserAdminServiceTest`、`AuthorizationServiceTest`、`AuthServiceTest`
- 统计：4 个测试通过，0 个失败，0 个错误，0 个跳过

## 前端验证

- 命令：`npm test`
- 路径：`bbird-hive-web`
- 结果：通过
- 统计：4 个测试文件通过，4 个测试通过

## 契约与集成验证

- 命令：`npm test`
- 路径：项目根目录
- 结果：通过
- 覆盖：契约测试、集成测试和前端测试桩
- 统计：14 个测试文件通过，14 个测试通过

## 真实 e2e 验证（2026-06-05 15:02 复核）

- 后端 `localhost:8081`、前端 `localhost:3000` 真实运行。
- 登录 `admin / Admin123!` 成功，返回 snowflake id `2062791991655428097`（字符串形式，19 位）。
- `GET /api/admin/users` 列出 3 个账号（admin / bob / carol），全部使用雪花 ID。
- `POST /api/admin/users` 创建 bob（`USER`）和 carol（`ADMIN`），均生成独立雪花 ID 并写 `USER_CREATED` 审计事件。
- `GET /api/admin/access-events` 返回 `LOGIN_SUCCESS`、`USER_CREATED` 事件，actor / target ID 全部为字符串。

## 视觉对齐复核（2026-06-05）

- 依据：`/Users/sie/Library/Application Support/Open Design/namespaces/release-stable/data/projects/432f31ed-a9a2-4e27-89ec-f8baa39e8a84/`
  中的 `login.html`、`login-2.html`、`index.html`、`mcp-servers.html` 等原型。
- 落点：
  - `app/styles.css` 补齐 `.authed-shell`、`.entry-grid`、`.entry-card`、`.pw-notice`、`.form-hint`、`.form-actions`、`.kv`、`.menu`、`.menu-item` 等视觉类，token 沿用原型 OKLCH 变量。
  - 新建 `components/shell/AuthedShell.tsx`，对已登录页面提供 topnav + 单列主区；带 `requireAdmin` 守卫，普通用户访问管理端时返回「需要管理员权限」并触发跳转。
  - 新建 `components/shell/ProfileMenu.tsx`，把右上角头像改成下拉菜单（个人设置 → /account、修改密码 → /account/password、退出登录），点空白与 Esc 关闭。
  - `LoginForm` / `ChangePasswordForm` / `CreateUserForm` / `ResetPasswordButton` / `InitialPasswordNotice` 五个表单组件按 `login.html` 的 `.field` + mono 大写 label + 绿色 focus 重写，并补上提交状态、错误提示、初始密码一次性提示。
  - `app/login/page.tsx`、`app/admin/page.tsx`、`app/admin/users/page.tsx`、`app/admin/users/new/page.tsx`、`app/admin/access-events/page.tsx`、`app/account/page.tsx`、`app/account/password/page.tsx` 全部接入新壳与 `PageHeader`。
- 测试：前端 4 + 集成 4 + 契约 6 共 14 个测试文件 14 个用例全部通过，无视觉相关的回归。

## 雪花 ID 重构复核（2026-06-05）

- 迁移：Flyway 成功执行 V002，TRUNCATE 旧 UUID 数据后 `ALTER COLUMN` 4 张表的主外键为 `BIGINT`。
- 实体：`UserEntity` / `SessionEntity` / `PasswordCredentialEntity` / `AccessEventEntity` 全部 `Long id` + `@TableId(type = IdType.ASSIGN_ID)`。
- 种子：`DataInitializer` 启动时若 `auth_user` 为空，幂等植入 `admin / Admin123!`，snowflake id 写入日志可追踪。
- API：所有 ID 在响应中以字符串形式返回，避免 JavaScript 64 位精度问题；前端 TS `id: string` 类型未变。
- Session cookie `MAS_SESSION` 改为 snowflake `Long.toString`；Redis 同步改为 stringified Long。

## 依赖安装记录

- 命令：`npm install`
- 路径：项目根目录
- 结果：完成，但 `npm audit` 提示 5 个漏洞，其中 1 个 critical
- 命令：`npm install`
- 路径：`bbird-hive-web`
- 结果：完成，但 `npm audit` 提示 12 个漏洞，其中 1 个 critical
- 处理：未执行 `npm audit fix --force`，因为该命令可能进行破坏性版本升级；后续应单独评估依赖升级方案。

## 说明

- 首次 Maven 验证因网络下载中断失败，清理残留依赖并重试后通过。
- 当前测试为本 feature 的功能、契约和集成验收基础覆盖，后续进入真实数据库、Redis、MCP、skills、sandbox、Docker 和 Kubernetes 联调时需要补充端到端测试。
- 视觉对齐基于 Open Design 项目 `432f31ed-a9a2-4e27-89ec-f8baa39e8a84` 中的原型；后续 console 类的页面（智能体控制台、技能库、MCP 服务器）以本批新增的 AuthedShell + PageHeader + entry-grid 为基底继续推进。
- 雪花 ID 重构属于规格变更（data-model 改 Long），具体落到 tasks.md T092–T110。
