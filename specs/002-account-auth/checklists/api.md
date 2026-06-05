# API 需求质量清单：账号认证与平台角色

**目的**：检验 API 契约、错误格式、版本化与跨服务约定是否在需求层被清晰定义
**对应规格**：[spec.md](../spec.md)、[contracts/openapi.yaml](../contracts/openapi.yaml)
**生成时间**：2026-06-05

## 错误响应一致性

- [ ] CHK001 - 所有 4xx/5xx 响应是否统一使用 \`ErrorResponse\` 结构（code/message/timestamp/requestId）？[Consistency, contracts/openapi.yaml]
- [ ] CHK002 - 错误码命名空间（\`AUTH_*\` vs \`BIRD_*\`）与登录失败、权限拒绝、账号停用、参数错误是否在 spec 中定义？[Completeness, Gap]
- [ ] CHK003 - 401（未登录）与 403（角色不足）的区分是否在所有受保护端点中保持一致？[Consistency, Spec §US2 + §FR-006]
- [ ] CHK004 - 登录失败具体是 401 还是 400（凭据错 vs 请求体错）是否有显式规则？[Clarity, Spec §US1 验收 3]

## 路径与版本

- [ ] CHK005 - 是否所有 API 都在 \`/api\` 前缀下，路径是否需要 \`/v1\` 版本号？[Coverage, contracts/openapi.yaml + Gap]
- [ ] CHK006 - 路径参数（如 \`/admin/users/{userId}/password-reset\`）的格式约束（数字 vs 雪花字符串）是否在 spec 明确？[Clarity, contracts/openapi.yaml]
- [ ] CHK007 - 雪花 ID 在响应中序列化为字符串是否同时在 spec 与 data-model 中声明？[Consistency, data-model.md + Gap]

## 契约与限流

- [ ] CHK008 - 跨服务契约（前端调用后端的认证方式、cookie 名、CORS、CSRF 策略）是否在 spec 明确？[Coverage, Gap]
- [ ] CHK009 - 登录、创建账号、密码修改/重置端点是否需要限流（防爆破）需求？spec 明确「不限制失败次数」是否同时说明了限流策略？[Clarity, Spec §FR-018 + Gap]
- [ ] CHK010 - 审计查询 \`/admin/access-events\` 的分页参数（page/size/排序）是否有上限与默认值？[Completeness, Gap]

## 审计可观察

- [ ] CHK011 - 审计事件 ID 在响应中是否可关联到 \`actorUserId\` / \`targetUserId\` / \`eventType\` 三元组？[Consistency, contracts/openapi.yaml]
- [ ] CHK012 - 审计事件接口是否需要按时间区间、事件类型、用户过滤的查询参数？[Coverage, Gap]
