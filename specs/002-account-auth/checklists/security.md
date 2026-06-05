# 安全需求质量清单：账号认证与平台角色

**目的**：检验认证、授权、会话、密码、审计的安全需求是否充分、清晰
**对应规格**：[spec.md](../spec.md) §FR-001 ~ §FR-018、§边界情况
**生成时间**：2026-06-05

## 凭据与会话

- [ ] CHK001 - 密码哈希算法（BCrypt 工作因子）、密码强度下限是否在 spec 中量化？[Clarity, Gap]
- [ ] CHK002 - 会话 ID 生成方式（雪花 ID / UUID / 不可预测随机）是否在 spec 明确？[Clarity, Gap]
- [ ] CHK003 - 会话存储（Redis key 命名、TTL、是否 sliding expiration）是否在 spec 明确？[Coverage, Gap]
- [ ] CHK004 - Session cookie 的属性（HttpOnly、Secure、SameSite、Path、Domain）是否在 spec 明确？[Coverage, Gap]
- [ ] CHK005 - CSRF 防护策略（SameSite=Strict / token 校验 / Origin 校验）是否在 spec 明确？[Coverage, Gap]

## 暴力破解与降级

- [ ] CHK006 - 「不限制失败次数」是否同时定义「是否记录 IP、UA、是否需要 WAF/CDN 层防护」？[Clarity, Spec §FR-018 + Gap]
- [ ] CHK007 - 管理员降级为普通用户后，**现有会话**是否被立即吊销、还是下次访问再校验？[Edge Case, Spec §边界]
- [ ] CHK008 - 账号停用后，**现有会话**的拦截时机是否在 spec 明确？[Edge Case, Spec §边界]

## 审计与可追溯

- [ ] CHK009 - 审计事件是否覆盖 spec §FR-008 全部 5 类（登录/退出/登录失败/角色变更/权限拒绝）？[Coverage, Spec §FR-008]
- [ ] CHK010 - 审计事件是否包含账号状态变更（DISABLED/ENABLED）？[Coverage, Spec §边界 + Gap]
- [ ] CHK011 - 审计事件的「结果」（成功/失败/原因）字段是否在 spec 明确？[Clarity, Gap]
- [ ] CHK012 - 审计事件是否记录 IP、UA、来源端点？[Coverage, Gap]
- [ ] CHK013 - 审计事件查询接口是否对普通用户隐藏、只对管理员开放？[Coverage, Spec §FR-005]

## 密码生命周期

- [ ] CHK014 - 密码修改/重置后旧会话是否全部吊销（spec 明确）？[Consistency, Spec §FR-017 + §边界]
- [ ] CHK015 - 初始密码的展示窗口（响应返回后是否在服务端打 log、是否落库明文）是否在 spec 明确？[Clarity, Spec §FR-013 + §FR-014 + Gap]
- [ ] CHK016 - 管理员创建账号后是否需要强制用户首次登录时改密？[Coverage, Gap]
