"use client";

import { AuthedShell } from "../../../components/shell/AuthedShell";
import { PageHeader } from "../../../components/shell/PageHeader";
import { ChangePasswordForm } from "../../../components/auth/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <AuthedShell fallbackTitle="修改密码">
      <PageHeader
        title="修改密码"
        sub="设置新密码后旧密码立即失效，请妥善保存新密码。"
        backHref="/account"
        backLabel="返回个人工作空间"
      />

      <div className="panel" style={{ maxWidth: 480 }}>
        <ChangePasswordForm />
      </div>
    </AuthedShell>
  );
}
