#!/usr/bin/env bash
set -euo pipefail

podman run --name my-agentscope-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=my_agentscope -p 3306:3306 -d mysql:8 || true
podman run --name my-agentscope-redis -p 6379:6379 -d redis:latest || true
