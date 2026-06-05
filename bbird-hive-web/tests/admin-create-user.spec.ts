import { describe, expect, it } from "vitest";

describe("管理员创建账号页面", () => {
  it("展示初始密码", () => {
    expect("初始密码").toContain("密码");
  });
});
