CREATE TABLE auth_user (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_by_admin_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP NULL
);

CREATE TABLE auth_password_credential (
    user_id VARCHAR(36) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    generated_by_system BOOLEAN NOT NULL,
    last_changed_at TIMESTAMP NOT NULL,
    changed_by_user_id VARCHAR(36) NOT NULL
);

CREATE TABLE auth_session (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role_snapshot VARCHAR(32) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NULL,
    status VARCHAR(32) NOT NULL
);

CREATE TABLE auth_access_event (
    id VARCHAR(36) PRIMARY KEY,
    actor_user_id VARCHAR(36) NULL,
    target_user_id VARCHAR(36) NULL,
    event_type VARCHAR(64) NOT NULL,
    target_resource VARCHAR(255) NULL,
    result VARCHAR(32) NOT NULL,
    reason VARCHAR(255) NULL,
    occurred_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_auth_access_event_actor ON auth_access_event(actor_user_id);
CREATE INDEX idx_auth_access_event_target ON auth_access_event(target_user_id);
CREATE INDEX idx_auth_access_event_type_time ON auth_access_event(event_type, occurred_at);
