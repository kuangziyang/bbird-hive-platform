# 账号认证本地依赖

使用 Podman 启动 MySQL 8 和 Redis：

```bash
podman run --name bbird-hive-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=my_agentscope -p 3306:3306 -d mysql:8
podman run --name bbird-hive-redis -p 6379:6379 -d redis:latest
```
