# 数据模型：账号认证与平台角色

> 本版本所有主键 / 外键均使用 **雪花 ID**（Long / BIGINT），由 MyBatis-Plus `IdType.ASSIGN_ID` 自动生成；
> 雪花 ID 长度 19 位、单调递增、便于分库分表与时间排序。API 层以字符串形式序列化以避免 JavaScript 64 位精度损失。

## Entity: User

平台账号。

**持久化说明**: 使用 MyBatis-Plus 对应用户表实体、Mapper 和 Service；`username` 建立唯一约束。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long (雪花) | 必填，唯一 | 用户主键 |
| username | String | 必填，全平台唯一 | 登录用户名 |
| passwordHash | String | 必填 | 密码凭据，不存储明文密码 |
| role | Enum | 必填，`USER` 或 `ADMIN` | 平台角色 |
| status | Enum | 必填 | `ACTIVE`、`DISABLED` |
| createdByAdminId | Long (雪花) | 必填 | 创建该账号的管理员；种子 admin 记为 `0` |
| createdAt | DateTime | 必填 | 创建时间 |
| updatedAt | DateTime | 必填 | 最近更新时间 |
| lastLoginAt | DateTime | 可空 | 最近成功登录时间 |

### Validation Rules

- `username` 必须全平台唯一。
- `role` 只能是普通用户或管理员。
- `DISABLED` 状态账号不得登录。
- 普通用户不得创建账号，不得修改他人密码。
- 管理员可以创建账号、重置密码、调整角色和账号状态。

### State Transitions

```text
ACTIVE -> DISABLED: 管理员停用账号
DISABLED -> ACTIVE: 管理员恢复账号
```

## Entity: PasswordCredential

用户密码凭据和密码变更状态。

**持久化说明**: 使用 MyBatis-Plus 对应密码凭据表实体、Mapper 和 Service；通过 `userId` 与 `User` 一对一关联。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| userId | Long (雪花) | 必填，唯一 | 关联用户 |
| passwordHash | String | 必填 | 当前密码哈希 |
| generatedBySystem | Boolean | 必填 | 当前密码是否由系统生成 |
| lastChangedAt | DateTime | 必填 | 最近密码变更时间 |
| changedByUserId | Long (雪花) | 必填 | 操作人，可能是本人或管理员 |

### Validation Rules

- 平台不得在账号创建或重置完成后再次明文展示初始密码。
- 用户修改密码或管理员重置密码后，旧密码必须失效。
- 密码明文只允许在创建或重置完成页临时展示给管理员。

## Entity: Session

用户登录后的活动会话。活动状态存入 Redis，必要摘要可写入 MySQL 供审计。

**持久化说明**: 活动会话主要由 Redis 管理（key=`auth:session:{sessionId}`，value 为 `userId` 字符串，TTL 8 小时）；会话摘要需要落库时使用 MyBatis-Plus 写入。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long (雪花) | 必填，唯一 | 会话主键；写入 cookie `MAS_SESSION` 时转字符串 |
| userId | Long (雪花) | 必填 | 关联用户 |
| roleSnapshot | Enum | 必填 | 登录时平台角色 |
| startedAt | DateTime | 必填 | 登录时间 |
| expiresAt | DateTime | 必填 | 过期时间 |
| endedAt | DateTime | 可空 | 退出或失效时间 |
| status | Enum | 必填 | `ACTIVE`、`EXPIRED`、`SIGNED_OUT`、`REVOKED` |

### Validation Rules

- 会话过期后必须拒绝访问受保护资源。
- 用户退出后，会话必须立即失效。
- 管理员降级为普通用户后，现有管理端访问必须被拒绝。

## Entity: AccessEvent

登录、退出、权限拒绝和账号安全相关审计事件。

**持久化说明**: 使用 MyBatis-Plus 对应访问事件表实体、Mapper 和 Service；MySQL 8 索引见 V001/V002 迁移。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long (雪花) | 必填，唯一 | 事件主键 |
| actorUserId | Long (雪花) | 可空 | 触发事件的用户；登录失败且用户不存在时为 null |
| targetUserId | Long (雪花) | 可空 | 事件关联的目标用户（创建/重置密码等） |
| eventType | Enum | 必填 | `LOGIN_SUCCESS` / `LOGIN_FAILURE` / `SIGN_OUT` / `USER_CREATED` / `PASSWORD_CHANGED` / `PASSWORD_RESET` / `STATUS_CHANGED` / `PERMISSION_DENIED` |
| targetResource | String | 可空 | 触发的接口路径或资源标识 |
| result | String | 必填 | `SUCCESS` / `FAILURE` |
| reason | String | 可空 | 失败原因 / 说明 |
| occurredAt | DateTime | 必填 | 事件时间 |

### Validation Rules

- 所有 `LOGIN_SUCCESS` / `LOGIN_FAILURE` / `SIGN_OUT` / `PERMISSION_DENIED` / `PASSWORD_CHANGED` / `PASSWORD_RESET` / `STATUS_CHANGED` / `USER_CREATED` 事件必须落库，便于审计追溯。
- API 列表接口（`/api/admin/access-events`）需管理员权限，返回 `AccessEventDto`，ID 全部以字符串形式返回。
