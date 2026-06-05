# 003-agent-management 启动包

**前置**：002-account-auth 已收口，push 到 `origin/002-account-auth`（12 commit）。
**目标**：基于已有 `specs/003-agent-management/spec.md`（草案，130+ 行）继续走 spec-kit 流程。

## 现状

- `specs/003-agent-management/spec.md` 已含 3 个用户故事（P1 创建、P2 发布、P3 管理员管理）、8 个 FR、4 个 SC、边界情况、关键实体
- `specs/003-agent-management/checklists/requirements.md` 已勾选 14 项 spec 质量项
- `specs/README.md` 建议规划顺序：**002 → 003 → 007 → 004 → 005 → 006**

## 依赖上下游

- **上游**：002 已收口（账号 + 角色 + 会话 + 审计基础）
- **下游**：007-agent-runtime-capabilities（智能体 MCP/Skills/沙箱运行时，003 假设运行时由 007 提供）
- **横向**：004-agent-chat（消费已发布智能体）、005-demand-pool-collaboration（消费已发布智能体）

## 宪法约束（constitution 1.1.0）

- **III. AgentScope 作为 Agent 框架**：必须用 AgentScope 定义/组织/运行智能体
- **III 边界**：AgentScope 承担 Agent 建模/协作/运行语义，Spring Cloud Alibaba AI 承担微服务/平台集成/基础设施
- **V. MySQL 8 + Redis + 可观测质量基线**：智能体元数据/版本/事件落 MySQL，配置/权限缓存走 Redis，结构化日志+指标+审计必备
- **VI. 中文优先**：所有 spec/plan/tasks/checklist/对话必须中文

## 5 个最该问的澄清问题（按 spec-kit clarify 流程）

按 Impact × Uncertainty 启发式挑选，覆盖范围 / 角色 / 可见性 / 版本 / 工具边界：

### Q1：智能体的可见范围模型（FR-002 / FR-004）

| Option | Description |
|--------|-------------|
| A | **私有 / 公开** 两级（仅创建者 / 全平台） |
| B | **私有 / 指定用户 / 公开** 三级 |
| C | **私有 / 同部门 / 公开**（需引入部门概念） |
| Short | 提供其他 ≤5 词的方案 |

**Recommended:** B — 与 002 账号模型对齐（指定用户列表即 ACL），不引入新部门概念。

### Q2：智能体版本与发布的语义（FR-005 / US2 验收 3）

| Option | Description |
|--------|-------------|
| A | **保存即新版本**（草稿态、版本号自增），发布是状态切换，编辑草稿不影响已发布版本 |
| B | **发布即新版本**（草稿直接覆盖，发布时固化新版本号），已发布版本不可改 |
| C | **每次保存都产生历史版本**（可回滚），发布是「激活某版本」 |
| Short | 提供其他 ≤5 词的方案 |

**Recommended:** C — 满足 002 收口时提出的"修改关键配置应要求重新确认发布"以及审计可追溯。

### Q3：管理员停用与用户归档的边界（FR-007 / 边界情况）

| Option | Description |
|--------|-------------|
| A | **管理员停用** = 平台强制（用于违规/安全），**用户归档** = 用户自愿（不再用） |
| B | **管理员停用 = 临时禁用可恢复**，**用户归档 = 永久隐藏不计入列表** |
| C | **合并为单一 disable 状态**，区分只是事件类型（管理员/用户） |
| Short | 提供其他 ≤5 词的方案 |

**Recommended:** A — 边界清晰，事件类型不同（`AGENT_DISABLED_BY_ADMIN` vs `AGENT_ARCHIVED_BY_OWNER`）。

### Q4：工具权限 / 沙箱配置是否在 003 范围内（FR-002 / 假设段）

| Option | Description |
|--------|-------------|
| A | **003 只存占位字段**（`tools` / `sandbox` JSON 字符串），007 详细化 |
| B | **003 实现 MCP 工具白名单/黑名单**（但不下发到运行时） |
| C | **003 实现工具列表 + 沙箱约束**（与 007 重叠一部分） |
| Short | 提供其他 ≤5 词的方案 |

**Recommended:** A — 与 README 规划顺序（003 → 007）一致，003 留字段由 007 详化。

### Q5：智能体创建时是否需要管理员审核（US1 验收 1）

| Option | Description |
|--------|-------------|
| A | **不需要审核**，普通用户创建即可用（草稿态） |
| B | **发布需要审核**，草稿可自由创建 |
| C | **创建即需要审核**（强治理） |
| Short | 提供其他 ≤5 词的方案 |

**Recommended:** A — 与「发布需校验必填配置」（FR-003）配合，治理重点在「发布」而非「创建」，与 002 平台角色模型（普通用户有完整自主权）一致。

## 建议的 spec-kit 命令顺序

```bash
# 1. 拉取最新 main + 002 收口结果
git fetch origin && git checkout main && git pull

# 2. 建 003 feature 分支
git checkout -b 003-agent-management

# 3. 把 003 START_HERE.md 一起带上，后续 commit 在这个分支
git add specs/003-agent-management/START_HERE.md
git commit -m "docs(003): 启动包 - 现状/依赖/5 澄清问题/命令顺序"

# 4. 跑 /speckit-clarify（交互式回答上述 5 个 Q1-Q5）
#    Codex CLI 中调用：speckit-clarify

# 5. 跑 /speckit-plan
#    Codex CLI 中调用：speckit-plan

# 6. 跑 /speckit-tasks
#    Codex CLI 中调用：speckit-tasks

# 7. 跑 /speckit-analyze
#    Codex CLI 中调用：speckit-analyze

# 8. 跑 /speckit-implement + 真实环境联调
#    Codex CLI 中调用：speckit-implement

# 9. 跑 /speckit-checklist（生成 003 的多主题质量清单）

# 10. 收口 verification.md + 推分支
```

## 给当前会话的 next action

由你决定：
- (a) **现在就开 003 分支**，把 5 个 Q1-Q5 在这里回答（可以一次性 5 个 yes/specific），我帮你写回 spec.md Clarifications 段，然后继续 plan/tasks
- (b) **暂停**，等你想清楚再开新会话
- (c) **先看看 003 spec.md 是否要补充输入资料**（如已有 002 实际产出的 DTO/接口/审计事件清单需要 003 复用）

如果选 (a)，请按以下格式回我：
- Q1: A / B / C / 自由回答
- Q2: ...
- Q3: ...
- Q4: ...
- Q5: ...
