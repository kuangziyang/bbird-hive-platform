"use client";

import { useEffect, useState } from "react";

let pushToast: (msg: string) => void = () => {};

export function toast(msg: string) {
  pushToast(msg);
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    pushToast = (next: string) => {
      setMsg(next);
      window.setTimeout(() => setMsg((cur) => (cur === next ? null : cur)), 2400);
    };
    return () => {
      pushToast = () => {};
    };
  }, []);

  return (
    <div id="toast" className={`toast${msg ? " is-show" : ""}`} role="status" aria-live="polite">
      <span id="toastMsg">{msg ?? ""}</span>
    </div>
  );
}
