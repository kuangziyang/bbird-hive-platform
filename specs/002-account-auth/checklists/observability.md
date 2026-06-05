# 可观测性需求质量清单：账号认证与平台角色

**目的**：检验日志、指标、审计、链路追踪是否在 spec 层有明确约束
**对应规格**：[spec.md](../spec.md) §FR-008、宪法 V
**生成时间**：2026-06-05

## 结构化日志

- [ ] CHK001 - 登录成功/失败/退出、密码修改/重置、账号创建、权限拒绝是否都有结构化日志字段（userId、eventType、result、IP、UA、requestId）？[Coverage, Spec §FR-008]
- [ ] CHK002 - 日志级别（INFO/WARN/ERROR）是否在 spec 中按事件类型明确？[Clarity, Gap]
- [ ] CHK003 - 敏感字段（密码、token、sessionId）是否在 spec 明确不入日志？[Coverage, Gap]

## 指标

- [ ] CHK004 - 是否需要在 spec 定义登录成功率、失败率、密码修改次数、权限拒绝次数等业务指标？[Coverage, Gap]
- [ ] CHK005 - 性能指标（登录 P95 < 1s、管理员操作 P95 < 3s）是否在 spec 与宪法层一致？[Consistency, plan.md + Constitution V]

## 审计与链路追踪

- [ ] CHK006 - 审计事件与会话请求的关联（同一 sessionId 的所有事件）是否在 spec 明确？[Coverage, Gap]
- [ ] CHK007 - 跨服务调用（前端 → auth-service → 后续服务）的 requestId 透传是否在 spec 明确？[Coverage, Gap]

## 异常与降级

- [ ] CHK008 - MySQL / Redis 不可用时的降级策略（拒绝服务 vs 缓存击穿）是否在 spec 明确？[Edge Case, Gap]
- [ ] CHK009 - 审计写库失败是否阻塞主业务（拒绝登录 vs 允许登录但记录失败）是否在 spec 明确？[Edge Case, Gap]
