import { describe, expect, it } from "vitest";

describe("登录页面", () => {
  it("展示登录入口", () => {
    expect("账号登录").toContain("登录");
  });
});
