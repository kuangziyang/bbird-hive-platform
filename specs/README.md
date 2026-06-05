# 多智能体平台规格索引

本目录只保留可独立规划、实现和测试的 feature spec。平台总览不作为 spec 维护，
避免同一需求在总览和具体规格中重复更新。

## 功能规格

- `002-account-auth`: 账号登录、会话、普通用户和管理员两种平台角色。
- `003-agent-management`: 普通用户创建、编辑、发布智能体；管理员查看和管理智能体。
- `004-agent-chat`: 用户与单个智能体一对一对话、执行任务、查看过程和产出。
- `005-demand-pool-collaboration`: 需求池、多智能体协作、自动协作群聊、进度查询和任务重分配。
- `006-admin-console`: 管理端治理、监控、调试和智能体管理。
- `007-agent-runtime-capabilities`: 用户配置自己智能体的 MCP、Skills、沙箱能力；管理员维护平台级能力、Docker 和 Kubernetes 状态。

## 建议规划顺序

1. `002-account-auth`
2. `003-agent-management`
3. `007-agent-runtime-capabilities`
4. `004-agent-chat`
5. `005-demand-pool-collaboration`
6. `006-admin-console`
