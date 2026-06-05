"use client";

import { AuthedShell } from "../../../../components/shell/AuthedShell";
import { PageHeader } from "../../../../components/shell/PageHeader";
import { CreateUserForm } from "../../../../components/auth/CreateUserForm";

export default function NewUserPage() {
  return (
    <AuthedShell requireAdmin fallbackTitle="创建账号">
      <PageHeader
        title="创建账号"
        sub="填写用户名、平台角色和账号状态。保存后系统会生成初始密码，仅展示一次。"
        backHref="/admin"
        backLabel="返回管理端"
      />

      <div className="panel" style={{ maxWidth: 520 }}>
        <CreateUserForm />
      </div>
    </AuthedShell>
  );
}
