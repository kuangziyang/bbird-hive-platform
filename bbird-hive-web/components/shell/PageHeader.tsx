import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowLeft } from "./Icon";

interface PageHeaderProps {
  title: string;
  sub?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, sub, backHref, backLabel, actions }: PageHeaderProps) {
  return (
    <div className="page-head">
      <div>
        {backHref ? (
          <Link href={backHref} className="back-link">
            <IconArrowLeft size={12} />
            {backLabel ?? "返回"}
          </Link>
        ) : null}
        <h1>{title}</h1>
        {sub ? <p className="sub">{sub}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}
