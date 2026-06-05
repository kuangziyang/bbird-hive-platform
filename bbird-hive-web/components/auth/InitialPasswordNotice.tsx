"use client";

import { IconKey } from "../shell/Icon";

interface InitialPasswordNoticeProps {
  password: string;
  onDismiss?: () => void;
}

export function InitialPasswordNotice({ password, onDismiss }: InitialPasswordNoticeProps) {
  if (!password) {
    return null;
  }
  return (
    <aside className="pw-notice" role="status" aria-live="polite">
      <div style={{ flex: 1 }}>
        <div className="pw-notice-title">
          <IconKey size={12} />&nbsp;请安全转交用户
        </div>
        <p className="pw-notice-body">
          初始密码仅在此处展示一次，关闭后不再显示，请通过线下渠道转交给用户。
        </p>
        <code className="pw-notice-value">{password}</code>
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onDismiss}
          aria-label="关闭初始密码提示"
          style={{ alignSelf: "flex-start" }}
        >
          知道了
        </button>
      ) : null}
    </aside>
  );
}
