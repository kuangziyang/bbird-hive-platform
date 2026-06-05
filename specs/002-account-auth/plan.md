# Implementation Plan: 账号认证与平台角色

**Branch**: `001-multi-agent-platform` | **Date**: 2026-06-04 | **Spec**: `specs/002-account-auth/spec.md`

**Input**: Feature specification from `specs/002-account-auth/spec.md`

## Summary

实现多智能体平台的账号认证基础能力：管理员创建账号，平台仅支持普通用户和管理员两种角色；用户使用唯一用户名和密码登录；系统生成初始密码并由管理员转交；用户可修改自己的密码，管理员可重置密码；平台记录登录、退出、登录失败、角色变更、权限拒绝和密码相关事件。技术上按 Web 应用拆分前端与后端认证服务，前端采用支持 AI chat 的 Next.js + TypeScript + Vercel AI SDK + assistant-ui，后端遵循 Spring Cloud Alibaba AI 微服务基线，使用 MySQL 8 存储账号和审计数据，数据库访问使用 MyBatis-Plus，使用 Redis 管理会话状态。

## Technical Context

**Language/Version**: Java 21 LTS（后端）、TypeScript（前端）

**Primary Dependencies**: Maven、Spring Cloud Alibaba AI、Spring Boot、Spring Security、MyBatis-Plus、MySQL 8、Redis、Next.js、TypeScript、Vercel AI SDK、assistant-ui

**Storage**: MySQL 8 持久化用户、角色、密码凭据、会话摘要和访问事件，数据库操作通过 MyBatis-Plus Mapper 和 Service 完成；Redis 存储活动会话与会话过期状态

**Testing**: Maven test lifecycle、JUnit 5、Spring Boot Test、契约测试、前端组件/流程测试

**Target Platform**: Web 平台，后端服务运行在 Linux 容器环境，前端静态资源可独立部署

**Project Type**: Web application（后端微服务 + 前端 SPA）

**Performance Goals**: 95% 登录、退出、权限校验操作在 1 秒内完成；管理员创建账号和重置密码在 3 秒内完成

**Constraints**: 平台角色只能是普通用户和管理员；普通用户不能自助注册；登录失败不做次数限制或自动锁定，但必须记录失败事件；所有面向人的文档和任务使用中文

**Scale/Scope**: 初始支持内部/受邀用户场景，账号规模按 1,000 到 10,000 用户设计，后续平台功能复用此认证与会话基础

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ 前端采用 Next.js + TypeScript + Vercel AI SDK + assistant-ui，属于主流、维护活跃、易部署且支持 AI chat 的技术组合。
- ✅ 后端按 Spring Cloud Alibaba AI 微服务基线规划认证服务，包含服务边界、授权、审计和配置要求。
- ✅ 后端依赖管理采用 Maven，便于 Spring 生态依赖、测试和构建流程统一。
- ✅ 本 feature 不涉及 Agent 编排；后续 Agent 能力仍由 AgentScope 承担。
- ✅ 持久化使用 MySQL 8，数据库访问使用 MyBatis-Plus，会话和短期状态使用 Redis。
- ✅ 部署计划覆盖 Docker、Kubernetes 和本地 Podman 运行验证。
- ✅ 用户、会话、权限和审计变更包含单元、集成、契约测试以及结构化日志。
- ✅ 规格、计划、任务、检查清单和评审输出均使用中文，技术术语按宪法允许保留。

**Gate Result**: PASS，无宪法违规。

## Project Structure

### Documentation (this feature)

```text
specs/002-account-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── services/
│   └── auth-service/
│       ├── src/main/java/
│       ├── src/main/resources/
│       └── src/test/java/
└── shared/
    └── security/

frontend/
└── apps/
    └── web/
        ├── app/
        │   ├── login/
        │   ├── admin/
        │   └── account/
        ├── components/
        │   ├── auth/
        │   └── chat/
        ├── lib/
        │   ├── api/
        │   └── ai/
        └── tests/

deploy/
├── docker/
├── k8s/
└── podman/

tests/
├── contract/
└── integration/
```

**Structure Decision**: 采用前后端分离结构。`backend/services/auth-service` 承担账号、登录、会话、密码和审计能力；`frontend/apps/web` 使用 Next.js App Router 承担登录页、管理端账号管理入口、密码修改界面，并预留 `components/chat` 与 `lib/ai` 给后续 AI chat 工作台复用；`deploy/` 存放 Docker、Kubernetes 和本地 Podman 配置；`tests/` 存放跨服务契约和集成验证。

## Phase 0: Research

研究输出见 `specs/002-account-auth/research.md`。所有技术上下文中的关键决策已解析，无剩余待澄清项。

## Phase 1: Design & Contracts

设计输出：

- `specs/002-account-auth/data-model.md`
- `specs/002-account-auth/contracts/openapi.yaml`
- `specs/002-account-auth/quickstart.md`

## Post-Design Constitution Check

- ✅ 前端采用支持 AI chat 的主流 Next.js 技术组合，后端结构保持微服务边界清晰且易部署。
- ✅ 后端服务边界聚焦认证与授权基础，不引入无职责服务。
- ✅ 本 feature 无 AgentScope 运行语义，仅为后续 Agent 功能提供用户身份边界。
- ✅ 数据模型明确 MySQL 8 持久化实体、MyBatis-Plus 数据访问边界和 Redis 会话状态。
- ✅ quickstart 覆盖本地 Podman、Docker 镜像和 Kubernetes 验证路径。
- ✅ 设计产物包含审计事件、权限拒绝、会话过期和密码变更测试点。
- ✅ 全部面向人的设计文档使用中文。

**Gate Result**: PASS，无宪法违规。

## Complexity Tracking

> 无宪法违规，无需记录复杂度例外。
