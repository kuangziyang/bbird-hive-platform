# 验证记录：账号认证与平台角色

## 验证时间

- 2026-06-04 16:36 Asia/Shanghai（初版）
- 2026-06-05 11:50 Asia/Shanghai（视觉对齐后复核）
- 2026-06-05 15:02 Asia/Shanghai（账号管理 UI / 头像下拉 / 雪花 ID 重构后复核）
- 2026-06-05 17:50 Asia/Shanghai（analyze + checklist 收口后复核：审计事件名对齐 spec FR-008、文档回填路径/包名/分支名、4 主题 checklist 落地）

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

## analyze 扫描与修复结论

- 工具：`/speckit-analyze`（read-only 跨 spec/plan/tasks 一致性扫描）
- 时间：2026-06-05 17:30
- Constitution Alignment：PASS（宪法 1.1.0 六条原则无违规）
- Coverage：18 个 FR 全部覆盖，4 个 US 全部覆盖，110 个任务全 `[X]`

| 编号 | 级别 | 摘要 | 修复 |
|------|------|------|------|
| A1 | HIGH | 缺 `LOGOUT` 事件类型（代码实为 `SIGN_OUT`） | commit `60b8c87` 重命名为 `LOGOUT` |
| A2 | HIGH | 缺 `ACCESS_DENIED` 事件类型（代码实为 `PERMISSION_DENIED`） | commit `60b8c87` 重命名为 `ACCESS_DENIED` |
| A3 | MEDIUM | 缺 `USER_STATUS_CHANGED` 事件类型（代码实为 `STATUS_CHANGED`） | commit `60b8c87` 重命名为 `USER_STATUS_CHANGED` |
| A4 | LOW | spec.md FR-004 范围越界（提到智能体/会话等不在 002 范围） | commit `2aa8853` 加「非本 feature 实现范围」标注 |
| A5 | LOW | tasks.md Phase 8 标题「体验与基础设施修复」与 T092-T110 实际内容（雪花 ID 重构）不一致 | commit `2aa8853` 改标题为「雪花 ID 重构与体验/基础设施」 |

修复后无残留 HIGH/MEDIUM 项；LOW 全部关闭。

## 需求质量 checklist 收口

- 工具：`/speckit-checklist`（生成 UX/API/Security/Observability 四份主题 checklist）
- 路径：`specs/002-account-auth/checklists/{ux,api,security,observability}.md`（已 commit `fcd4297`）
- 项数：50 项需求质量检查点 + 已有 `requirements.md` 14 项 = 64 项

本批 checklist 是「对 spec 写的质量的单元测试」，不是 verification。下个 feature
的 Specify/Plan 阶段应主动翻阅这 4 份清单，避免遗漏。

### 已知需求质量 Gap（暂留待后续 feature / 真实环境联调时收敛）

| ID | 主题 | 摘要 | 后续处理 |
|----|------|------|----------|
| ux CHK002 | UX | 密码可见性切换、占位符一致性未在 spec 量化 | 后续 UX 集中收敛时补 spec |
| ux CHK009/010 | UX | 键盘可访问性与 aria-live 未在 spec 明 | 后续 a11y 专题补 spec |
| api CHK002 | API | 错误码命名空间（`AUTH_*` vs `BIRD_*`）未在 spec 明 | 后续 003+ 启动前补 spec |
| api CHK005 | API | API 是否需要 `/v1` 路径版本未在 spec 明 | 跨服务前补 spec |
| api CHK008 | API | CORS / cookie / CSRF 契约未在 spec 明 | 003 前端需要跨服务时补 spec |
| api CHK009 | API | 限流策略与「不限制失败次数」的边界未在 spec 明 | 真实上线前补 spec（涉及 WAF/CDN） |
| api CHK010 | API | 审计查询分页上限与默认值未在 spec 明 | 性能/安全评估后补 spec |
| security CHK001 | Security | 密码哈希 BCrypt 工作因子、密码强度下限未在 spec 量化 | 003 前补 spec |
| security CHK003 | Security | 会话 Redis key 命名、TTL、是否 sliding 未在 spec 明 | 性能/容量评估后补 spec |
| security CHK004/005 | Security | Session cookie 属性、CSRF 策略未在 spec 明 | 跨服务前补 spec |
| security CHK006 | Security | 「不限制失败次数」是否同时记录 IP/UA、是否需要 WAF 未明 | 真实上线前补 spec |
| security CHK011/012 | Security | 审计事件的「结果」、IP/UA/来源端点字段未在 spec 明 | 003 启动前补 spec |
| security CHK015 | Security | 初始密码响应后是否服务端打 log / 落库明文未明 | 安全评审前补 spec |
| security CHK016 | Security | 管理员创建账号后是否强制首次登录改密未明 | UX 评审补 spec |
| observability CHK001/002/003 | Observability | 结构化日志字段、级别、敏感字段未在 spec 量化 | 003 启动前补 spec |
| observability CHK004 | Observability | 业务指标（成功率/失败率/密码变更次数）未在 spec 明 | 性能/可观测专题补 spec |
| observability CHK008/009 | Observability | MySQL/Redis 不可用降级策略、审计失败阻塞策略未明 | 真实联调前补 spec |

注：以上 17 个 Gap 不阻塞本 feature 收口，因为：
- 本批核心（账号、登录、会话、角色、密码、审计）功能行为与数据契约完整
- 缺的是 spec 量化精度（数字、字段名、阈值），不是功能缺失
- 绝大多数 Gap 与跨服务、真实生产联调相关，需要在 003 启动前补 spec

## 说明

- 首次 Maven 验证因网络下载中断失败，清理残留依赖并重试后通过。
- 当前测试为本 feature 的功能、契约和集成验收基础覆盖，后续进入真实数据库、Redis、MCP、skills、sandbox、Docker 和 Kubernetes 联调时需要补充端到端测试。
- 视觉对齐基于 Open Design 项目 `432f31ed-a9a2-4e27-89ec-f8baa39e8a84` 中的原型；后续 console 类的页面（智能体控制台、技能库、MCP 服务器）以本批新增的 AuthedShell + PageHeader + entry-grid 为基底继续推进。
- 雪花 ID 重构属于规格变更（data-model 改 Long），具体落到 tasks.md T092–T110。
