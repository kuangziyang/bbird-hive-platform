<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- I. 前端主流与易部署优先
- II. Spring Cloud Alibaba AI 微服务后端
- III. AgentScope 作为 Agent 框架
- IV. 容器化与本地可复现部署
- V. MySQL 8、Redis 与可观测质量基线
- Added VI. 中文优先的文档与对话
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ⚠ .specify/templates/commands/*.md not present
Runtime guidance:
- ✅ AGENTS.md updated with Chinese-first documentation and response requirement
Follow-up TODOs:
- None
-->

# 多智能体平台 Constitution

## Core Principles

### I. 前端主流与易部署优先

前端技术选型必须使用主流、长期维护、社区成熟且便于部署的方案。每个功能计划
必须说明前端构建、静态资源交付、本地运行和生产部署方式。若选择非主流技术，
必须在计划中记录原因、替代方案和维护风险。

理由：多智能体平台需要快速迭代和稳定交付，前端技术不能成为部署、招聘、
维护或排障的阻碍。

### II. Spring Cloud Alibaba AI 微服务后端

后端必须基于 Spring Cloud Alibaba AI 构建微服务能力。服务边界必须围绕业务
能力划分，禁止为了形式化拆分而创建没有独立职责的服务。跨服务契约、配置、
服务发现、容错、权限和审计要求必须在计划阶段明确。

理由：平台需要承载多智能体协作、任务编排、权限治理和可扩展业务能力，
Spring Cloud Alibaba AI 是后端微服务与 AI 能力集成的默认基线。

### III. AgentScope 作为 Agent 框架

AgentScope 必须作为 Agent 相关能力的默认框架，用于定义、组织和运行智能体协作。
当 AgentScope 与 Spring Cloud Alibaba AI 的能力存在重合时，计划必须明确职责
边界：AgentScope 优先承担 Agent 建模、协作和运行语义，Spring Cloud Alibaba AI
优先承担微服务、平台集成和基础设施协作。任何重复实现必须有明确收益和风险说明。

理由：多智能体平台的核心差异化来自 Agent 协作能力，统一 Agent 框架可以
降低概念漂移、重复封装和后续维护成本。

### IV. 容器化与本地可复现部署

项目必须支持 Docker 和 Kubernetes 部署。所有核心服务必须具备容器化运行方式，
并提供可在本地使用 Podman 搭建的开发环境。计划和任务必须覆盖镜像构建、环境变量、
依赖服务、健康检查、配置挂载和部署验证。

理由：平台从本地开发到生产部署必须可复现，避免“只在某台机器可运行”的
环境差异。

### V. MySQL 8、Redis 与可观测质量基线

持久化数据库必须使用 MySQL 8，缓存技术必须使用 Redis。所有涉及数据、缓存、
跨服务调用或 Agent 任务执行的功能必须具备可测试、可观测和可追溯能力，包括
必要的单元测试、契约测试、集成测试、结构化日志、指标、链路追踪或审计记录。

理由：数据一致性、缓存可靠性和运行可见性是多智能体平台可信使用的基础。

### VI. 中文优先的文档与对话

除专有名词、技术术语、代码标识符、命令、路径、协议名、框架名、库名和必要的
英文错误信息外，项目文档、规格、计划、任务、注释说明、评审意见和与用户的对话
必须使用中文编写。若需要保留英文原文以避免歧义，必须同时提供中文解释。

理由：项目主要协作语境为中文，统一语言可以降低沟通成本、减少需求理解偏差，
并确保规格、计划和任务对非英文读者可审阅。

## 技术边界与架构约束

- 前端必须选择主流且易部署的技术；计划中必须给出选择理由和部署路径。
- 后端服务必须遵循 Spring Cloud Alibaba AI 微服务基线。
- Agent 能力必须优先使用 AgentScope；重合能力必须在计划中说明边界。
- 数据库必须使用 MySQL 8；缓存必须使用 Redis。
- 部署必须覆盖 Docker、Kubernetes 和本地 Podman 环境。
- 新增服务必须定义职责、依赖、配置、健康检查、权限边界和可观测要求。
- 跨服务通信、Agent 任务流转和关键数据变更必须具备可追踪记录。
- 不允许在未记录原因的情况下引入替代数据库、缓存、Agent 框架或部署体系。
- 除专业术语和代码相关标识外，所有面向人的文档、计划、任务和对话必须使用中文。

## 开发流程与质量门禁

- 每个功能计划必须通过 Constitution Check 后才能进入任务拆解。
- 计划必须说明前端、后端、Agent、数据、缓存和部署影响；不涉及的项必须明确写明原因。
- 任务必须按用户故事交付，并包含必要的基础设施、测试、部署和可观测任务。
- 涉及微服务契约、数据库结构、缓存策略、Agent 协作或权限边界的变更必须包含测试。
- 本地验证必须能够通过 Podman 启动核心依赖；部署验证必须覆盖 Docker 镜像和
  Kubernetes 清单或等价配置。
- 任何偏离本宪章技术基线的设计都必须在 Complexity Tracking 中记录原因、
  风险和被拒绝的更简单替代方案。
- 规格、计划、任务、检查清单和评审输出必须检查中文优先要求；英文术语必须仅在
  技术表达需要时保留，并提供必要中文解释。

## Governance

本宪章优先于普通实现偏好、临时约定和个人习惯。所有规格、计划、任务和代码评审
必须检查是否符合本宪章。

宪章修订必须说明变更动机、影响范围和迁移要求，并更新版本号：

- MAJOR: 删除或重定义核心原则，或引入与既有治理不兼容的要求。
- MINOR: 新增原则、章节或显著扩展技术/流程要求。
- PATCH: 澄清措辞、修正错误或不改变语义的细化。

每次修订必须更新 `Last Amended` 日期，并在宪章顶部的 Sync Impact Report 中记录
受影响模板和后续事项。计划阶段必须执行 Constitution Check；若有违反项，必须在
Complexity Tracking 中说明并获得明确接受后才能继续。

**Version**: 1.1.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-04
