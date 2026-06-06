# 快速启动：智能体创建与发布（003-agent-management）

本文档说明如何在本地启动 003-agent-management 的后端 agent-service 与前端扩展，并与 002-auth-service 联合跑通端到端流程。

## 前置

- 已完成 002-account-auth 收口（`origin/002-account-auth` 已 merge 到 main）
- 本地已启动 MySQL 8、Redis（Podman / Docker compose / 物理机均可）
- 已用 002 seed 账号 `admin / Admin123!` 登录

## 启动顺序

```bash
# 1. 启动 auth-service（002 收口；agent-service 复用其 session 鉴权）
cd bbird-hive-server/services/auth-service
mvn spring-boot:run          # 监听 8081

# 2. 启动 agent-service（003）
cd bbird-hive-server/services/agent-service
mvn spring-boot:run          # 监听 8082

# 3. 启动前端
cd bbird-hive-web
npm install
npm run dev                  # 监听 3000
```

## 后端验证

```bash
# 健康检查
curl http://localhost:8082/actuator/health

# 登录获取 session（用 002 收口的 admin 账号）
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' \
  -c /tmp/cookies.txt

# 列出当前用户的智能体（用 002 的 admin 账号）
curl http://localhost:8082/api/agents \
  -b /tmp/cookies.txt

# 创建智能体
curl -X POST http://localhost:8082/api/agents \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{
    "name": "researcher-001",
    "role": "researcher",
    "capability": "负责搜索公开资料并总结要点，输出结构化 Markdown",
    "toolConfig": { "allowList": ["web_search", "web_fetch"] },
    "sandboxConstraint": {
      "networkPolicy": { "egress": "allow" },
      "timeouts": { "wallClockSeconds": 300 }
    }
  }'

# 管理员列出所有智能体
curl http://localhost:8082/api/admin/agents -b /tmp/cookies.txt

# 管理员停用一个智能体
curl -X POST http://localhost:8082/api/admin/agents/{agentId}/disable \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"reason": "测试需要"}'
```

预期结果：
- agent-service 启动成功，健康检查返回 `{"status":"UP"}`
- `GET /api/agents` 返回当前用户（admin）的智能体列表
- `POST /api/agents` 返回 201，智能体详情含雪花 ID
- `GET /api/admin/agents` 列出 1 个智能体
- `POST .../disable` 返回 200，状态变为 `DISABLED`，事件 `AGENT_DISABLED_BY_ADMIN` 落库

## 前端验证

```bash
# 普通用户（用 admin 账号登录）
# 访问 http://localhost:3000/agents
# - 看到"我的智能体"列表
# - 点"+ 新建" → 填写 name / role / capability
# - 高级：编辑工具白名单（JSON）、沙箱约束（JSON）
# - 保存 → 列表出现新智能体

# 删除测试
# 创建一个新智能体（不引用）
# 列表中点删除 → 二次确认弹窗
# 确认 → 列表少一项
```

## Flyway 迁移

```bash
# agent-service 启动时自动执行 V001（agent + tool_config + sandbox_constraint + agent_event 4 张表）
# 可用 MySQL 客户端检查：
mysql -u root -p bbird_hive < /dev/stdin <<SQL
SHOW TABLES LIKE 'agent%';
SQL
```

预期看到：
- `agent`
- `agent_tool_config`
- `agent_sandbox_constraint`
- `agent_event`

## Docker

```bash
# 构建 agent-service 镜像
bash deploy/docker/build-agent-service.sh

# K8s 部署
kubectl apply -f deploy/k8s/agent-service.yaml
```

## Podman 本地依赖

详见 `deploy/podman/agent-dependencies.md`（与 002 同款模板）。

## 端到端测试

```bash
# 后端单元 + 集成测试
cd bbird-hive-server/services/agent-service
mvn -U test

# 前端组件 + 流程测试
cd bbird-hive-web
npm test

# 契约 + 集成测试
cd tests
npm test
```

预期：
- 后端 4 个测试类通过（AgentService / AgentAdminService / ToolConfig / SandboxConstraint）
- 前端 6+ 个测试通过（AgentForm / DeleteDialog / DisableDialog / ToolConfigEditor / SandboxConstraintEditor / AgentCard）
- 契约 + 集成 8+4 个测试通过

## 跨服务验证

```bash
# 002 收口后 admin 账号的 session 在 agent-service 仍有效（共享 BBIRD_SESSION cookie）
# 1. 002 创建账号 bob
# 2. 003 用 bob 登录 → 创建智能体 → 仅 bob 可见
# 3. admin 登录 → /api/admin/agents 看到 bob 的智能体
# 4. admin 停用 bob 的智能体 → bob 自己的列表也显示 DISABLED
```
