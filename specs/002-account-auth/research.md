# 研究记录：账号认证与平台角色

## Decision: 使用用户名 + 密码作为登录凭据

**Rationale**: 规格已明确采用用户名和密码。用户名在全平台唯一，适合内部/受邀账号体系，也避免早期强依赖邮箱、短信或外部身份系统。

**Alternatives considered**:

- 邮箱 + 密码：便于通知和找回，但用户已选择用户名 + 密码。
- 手机号 + 密码：会引入短信和号码合规处理，不适合当前“简单账号登录系统”。
- 外部身份系统：适合企业 SSO，但当前规格要求平台维护简单账号。

## Decision: 管理员创建账号，普通用户不能自助注册

**Rationale**: 平台面向内部/受邀用户，账号来源受控可以降低权限管理复杂度，并保持普通用户和管理员两种平台角色模型。

**Alternatives considered**:

- 公开注册：不符合当前范围。
- 预置账号：开发早期简单，但无法支持管理员日常管理。
- 外部身份导入：适合后续扩展，不作为首版账号来源。

## Decision: 系统生成初始密码并只在创建或重置完成时展示

**Rationale**: 系统生成初始密码能降低弱密码风险；只在创建或重置完成时展示，避免长期明文暴露。

**Alternatives considered**:

- 管理员手动设置初始密码：简单但弱密码风险更高。
- 用户首次登录设置密码：需要额外一次性令牌流程，不符合首版简单范围。

## Decision: 用户可修改密码，管理员可重置密码

**Rationale**: 普通用户自助修改密码减少管理员负担；管理员重置密码提供账号异常和忘记密码时的兜底能力。

**Alternatives considered**:

- 仅管理员重置：运维负担高。
- 仅用户修改：忘记密码时缺少管理兜底。
- 暂不支持：不满足账号生命周期基本需求。

## Decision: 登录失败不做次数限制或自动锁定，但必须记录事件

**Rationale**: 用户已明确选择不限制失败次数。为保留安全可追踪性，所有登录失败仍必须写入访问事件，供管理员观察异常行为。

**Alternatives considered**:

- 连续失败后临时锁定：安全性更好，但用户明确选择不采用。
- 仅记录不锁定：与当前决定一致。

## Decision: 会话状态使用 Redis，账号和审计使用 MySQL 8，数据库访问使用 MyBatis-Plus

**Rationale**: 宪法要求 MySQL 8 和 Redis。账号、角色、密码凭据和访问事件需要持久化；数据库操作按用户指定采用 MyBatis-Plus，便于在 Spring Boot 服务中快速完成实体映射、Mapper、Service 和条件查询；会话状态需要快速过期和撤销，适合 Redis。

**Alternatives considered**:

- 仅 MySQL 管理会话：实现简单但会话撤销和过期处理不够高效。
- 仅 Redis 记录事件：审计不可长期可靠保留。
- JPA/Hibernate：生态成熟，但当前项目明确要求使用 MyBatis-Plus。

## Decision: 前端采用 Next.js + TypeScript + Vercel AI SDK + assistant-ui

**Rationale**: Next.js 是主流 React Web 框架，适合前后端分离和静态/服务端混合部署；Vercel AI SDK 提供 TypeScript AI 应用、streaming、chat 和生成式 UI 能力；assistant-ui 提供面向 AI chat 的 React 组件、runtime 和适配能力。该组合满足“前端主流与易部署优先”，也为后续单智能体对话和需求群聊工作台保留 AI chat 扩展基础。

**Alternatives considered**:

- Vue 3 + Vite：主流且轻量，但 AI chat 生态和现成聊天 runtime 不如 Next.js + AI SDK + assistant-ui 贴合。
- React + Vite：可行，但缺少 Next.js App Router 与 AI SDK 官方生态的端到端示例优势。
- 纯服务端页面：前后端耦合较高，不利于后续多智能体工作台扩展。

**References**:

- Vercel AI SDK: https://vercel.com/ai-sdk
- assistant-ui Documentation: https://www.assistant-ui.com/docs

## Decision: 后端认证能力作为 auth-service 微服务

**Rationale**: 账号、会话、权限和审计是平台基础能力，应形成清晰服务边界，并为后续智能体、需求池和管理端提供统一身份上下文。

**Alternatives considered**:

- 所有功能放在单体服务：早期简单，但后续平台模块复用认证能力时边界不清。
- 每个模块各自实现认证：会造成重复和权限不一致。

## Decision: 后端依赖管理采用 Maven

**Rationale**: 用户明确要求后端依赖管理采用 Maven。Maven 与 Spring Boot、Spring Cloud Alibaba AI、MyBatis-Plus、测试生命周期和企业级 Java 构建流程匹配度高，适合作为后端服务统一构建入口。

**Alternatives considered**:

- Gradle：构建灵活，但当前项目明确要求 Maven。
- 多构建工具混用：会增加维护和任务拆解复杂度，不采用。
