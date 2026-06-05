import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/">
            <span className="brand-mark">⌬</span>
            <span>Agent Console</span>
          </a>
        </div>
      </header>
      <main className="login-page">
        <div className="login-bg" aria-hidden="true" />
        <section className="login-card" aria-label="登录">
          <h1>登录到 Agent Console</h1>
          <p className="login-sub">使用工作账号继续，初始密码由管理员转交。</p>
          <LoginForm />
          <p className="login-hint">本地默认管理员：admin / Admin123!</p>
        </section>
      </main>
    </>
  );
}
