"use client";

import Link from "next/link";
import type { UserSummary } from "../../lib/api/session";
import { ProfileMenu } from "./ProfileMenu";

interface TopNavProps {
  user: UserSummary;
}

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link href="/console" className="brand" aria-label="Agent Console">
          <span className="brand-mark">⌬</span>
          <span>Agent Console</span>
        </Link>
        <span className="spacer" />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
