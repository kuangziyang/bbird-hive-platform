# 快速开始：账号认证与平台角色

## 前置条件

- 已安装 Java 21 LTS。
- 已安装 Maven。
- 已安装 Node.js LTS。
- 已安装 Podman，用于本地启动 MySQL 8 和 Redis。
- 可使用 Docker 构建镜像，并可访问 Kubernetes 集群或本地等价环境。

## 本地依赖启动

```bash
podman run --name bbird-hive-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=my_agentscope \
  -p 3306:3306 \
  -d mysql:8

podman run --name bbird-hive-redis \
  -p 6379:6379 \
  -d redis:latest
```

## 后端服务验证

```bash
cd bbird-hive-server/services/auth-service
mvn test
mvn spring-boot:run
```

预期结果：

- 认证服务启动成功。
- 健康检查返回可用状态。
- MySQL 8 和 Redis 连接正常。
- MyBatis-Plus Mapper 和 Service 能完成用户、密码凭据和访问事件的基础读写。

## 前端验证

```bash
cd bbird-hive-web
npm install
npm run test
npm run dev
```

预期结果：

- 登录页可访问，登录卡片与 Open Design 原型视觉一致（OKLCH token、单列卡片、浅色 grid 背景）。
- 管理员账号可进入管理端入口（`/admin`），看到「创建账号」「访问事件」入口卡片。
- 普通用户访问管理端时被 `AuthedShell` 守卫拒绝，提示「需要管理员权限」并自动跳转回工作台。
- 普通用户访问 `/account` 可看到账号信息入口，进入 `/account/password` 修改自己的密码。
- Next.js 应用结构预留 `components/chat` 和 `lib/ai`，后续可接入 Vercel AI SDK 与 assistant-ui。

## 关键验收路径

1. 管理员登录。
2. 管理员进入 `/admin`，点击「创建账号」入口。
3. 管理员填写用户名、角色、状态，提交后看到一次性初始密码提示。
4. 普通用户使用用户名和初始密码登录。
5. 普通用户进入 `/account/password` 修改自己的密码。
6. 普通用户退出后旧会话失效。
7. 管理员在 `/admin/access-events` 看到上述登录、改密、退出事件。
8. 普通用户访问 `/admin/users/new` 被拒绝并记录访问事件。
9. 管理员在用户列表点击「重置密码」可看到新初始密码（一次性提示）。
10. 登录失败、权限拒绝、密码修改和密码重置事件均可在审计记录中查看。

## 容器与部署验证

```bash
docker build -f deploy/docker/auth-service.Dockerfile -t bbird-hive/auth-service:dev .
kubectl apply -f deploy/k8s/auth-service.yaml
kubectl rollout status deployment/auth-service
```

预期结果：

- 镜像构建成功。
- Kubernetes 部署成功。
- 健康检查通过。
