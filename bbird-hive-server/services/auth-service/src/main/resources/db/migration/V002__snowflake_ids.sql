-- V002: 切换为雪花 ID（Long/BIGINT）
-- 范围：auth_user / auth_password_credential / auth_session / auth_access_event
-- 旧数据为 UUID 字符串，无法 cast 到 BIGINT，TRUNCATE 后重置。
-- 初始 admin 由 DataInitializer 重新写入。

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE auth_access_event;
TRUNCATE TABLE auth_session;
TRUNCATE TABLE auth_password_credential;
TRUNCATE TABLE auth_user;
SET FOREIGN_KEY_CHECKS = 1;

-- auth_user
ALTER TABLE auth_user
  MODIFY id BIGINT NOT NULL,
  MODIFY created_by_admin_id BIGINT NOT NULL;

-- auth_password_credential
ALTER TABLE auth_password_credential
  MODIFY user_id BIGINT NOT NULL,
  MODIFY changed_by_user_id BIGINT NOT NULL;

-- auth_session
ALTER TABLE auth_session
  MODIFY id BIGINT NOT NULL,
  MODIFY user_id BIGINT NOT NULL;

-- auth_access_event
ALTER TABLE auth_access_event
  MODIFY id BIGINT NOT NULL,
  MODIFY actor_user_id BIGINT NULL,
  MODIFY target_user_id BIGINT NULL;
