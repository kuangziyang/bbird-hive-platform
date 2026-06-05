"use client";

import { FormEvent, useState } from "react";
import { createUser } from "../../lib/api/auth";
import { IconUser, IconShield } from "../shell/Icon";
import { InitialPasswordNotice } from "./InitialPasswordNotice";

type Role = "USER" | "ADMIN";
type Status = "ACTIVE" | "DISABLED";

export function CreateUserForm() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [status, setStatus] = useState<Status>("ACTIVE");
  const [initialPassword, setInitialPassword] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!username.trim()) {
      setMessage({ kind: "err", text: "请填写用户名" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await createUser(username.trim(), role, status);
      setInitialPassword(result.initialPassword);
      setMessage({ kind: "ok", text: `账号「${result.user.username}」已创建。` });
      setUsername("");
      setRole("USER");
      setStatus("ACTIVE");
    } catch (error) {
      setMessage({ kind: "err", text: error instanceof Error ? error.message : "创建失败" });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setInitialPassword(null);
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="cuUsername">
            <span>用户名</span>
            <span className="link-muted">平台内唯一</span>
          </label>
          <input
            id="cuUsername"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="例如：alice"
            autoComplete="off"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="cuRole">平台角色</label>
          <select id="cuRole" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="USER">普通用户</option>
            <option value="ADMIN">管理员</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="cuStatus">账号状态</label>
          <select id="cuStatus" value={status} onChange={(event) => setStatus(event.target.value as Status)}>
            <option value="ACTIVE">启用（ACTIVE）</option>
            <option value="DISABLED">停用（DISABLED）</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {role === "ADMIN" ? <IconShield size={14} /> : <IconUser size={14} />}
            {submitting ? "创建中…" : "创建账号"}
          </button>
        </div>
        {message ? (
          <p className={`form-hint ${message.kind === "err" ? "form-hint-err" : "form-hint-ok"}`} role="status">
            {message.text}
          </p>
        ) : null}
      </form>
      {initialPassword ? <InitialPasswordNotice password={initialPassword} onDismiss={reset} /> : null}
    </>
  );
}
