#!/usr/bin/env bash
set -euo pipefail

mvn -f backend/services/auth-service/pom.xml package
docker build -f deploy/docker/auth-service.Dockerfile -t my-agentscope/auth-service:dev .
