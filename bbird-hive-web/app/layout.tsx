import type { ReactNode } from "react";
import "./styles.css";

export const metadata = {
  title: "Agent Console · 多智能体管理",
  description: "管理多智能体平台的工作台"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
