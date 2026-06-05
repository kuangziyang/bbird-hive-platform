"use client";

import { useState } from "react";
import { resetPassword } from "../../lib/api/auth";
import { IconKey } from "../shell/Icon";
import { InitialPasswordNotice } from "./InitialPasswordNotice";

interface ResetPasswordButtonProps {
  userId: string;
  username: string;
}

export function ResetPasswordButton({ userId, username }: ResetPasswordButtonProps) {
  const [initialPassword, setInitialPassword] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    if (initialPassword) {
      setInitialPassword(null);
      return;
    }
    setSubmitting(true);
    try {
      const result = await resetPassword(userId);
      setInitialPassword(result.initialPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "重置失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="reset-cell">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClick}
        disabled={submitting}
        title={`重置 ${username} 的密码`}
      >
        <IconKey size={12} />
        {initialPassword ? "隐藏新密码" : submitting ? "重置中…" : "重置密码"}
      </button>
      {error ? <p className="form-hint form-hint-err">{error}</p> : null}
      {initialPassword ? (
        <InitialPasswordNotice password={initialPassword} onDismiss={() => setInitialPassword(null)} />
      ) : null}
    </div>
  );
}
