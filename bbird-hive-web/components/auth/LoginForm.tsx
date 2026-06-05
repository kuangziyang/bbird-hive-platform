"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api/auth";
import { IconArrowRight } from "../shell/Icon";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!username || !password) {
      setMessage({ kind: "err", text: "请填写用户名和密码" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(username, password);
      setMessage({ kind: "ok", text: `登录成功：${result.user.username}` });
      // 跳到工作台；refresh 让 Server Component 重新拉取当前用户
      router.push("/console");
      router.refresh();
    } catch (error) {
      setMessage({ kind: "err", text: error instanceof Error ? error.message : "登录失败" });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="loginUsername">用户名</label>
        <input
          id="loginUsername"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="工作账号用户名"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="loginPassword">
          <span>密码</span>
          <a href="#" className="link-muted" onClick={(e) => e.preventDefault()}>
            忘记密码？
          </a>
        </label>
        <input
          id="loginPassword"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
        {submitting ? "登录中…" : "登录"}
        {!submitting ? <IconArrowRight size={14} /> : null}
      </button>
      {message ? (
        <p className={`form-hint ${message.kind === "err" ? "form-hint-err" : "form-hint-ok"}`} role="status">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
