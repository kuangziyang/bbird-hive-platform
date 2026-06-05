"use client";

import { FormEvent, useState } from "react";
import { changePassword } from "../../lib/api/auth";
import { IconKey } from "../shell/Icon";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!currentPassword || !newPassword) {
      setMessage({ kind: "err", text: "请填写当前密码和新密码" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ kind: "err", text: "两次输入的新密码不一致" });
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage({ kind: "ok", text: "密码已修改，旧密码已失效。" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({ kind: "err", text: error instanceof Error ? error.message : "修改失败" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="cpCurrent">当前密码</label>
        <input
          id="cpCurrent"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="cpNew">新密码</label>
        <input
          id="cpNew"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="至少 8 位，包含字母与数字"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="cpConfirm">再次输入新密码</label>
        <input
          id="cpConfirm"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        <IconKey size={14} />
        {submitting ? "提交中…" : "修改密码"}
      </button>
      {message ? (
        <p className={`form-hint ${message.kind === "err" ? "form-hint-err" : "form-hint-ok"}`} role="status">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
