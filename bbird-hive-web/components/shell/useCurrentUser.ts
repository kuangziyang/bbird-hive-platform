"use client";

import { useEffect, useState } from "react";
import { currentUser } from "../../lib/api/auth";
import type { UserSummary } from "../../lib/api/session";

export function useCurrentUser() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    currentUser()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "未登录");
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, error };
}
