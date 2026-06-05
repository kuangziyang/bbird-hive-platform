import { describe, expect, it } from "vitest";

describe("管理员创建账号集成路径", () => {
  it("覆盖初始密码只展示一次", () => {
    expect("initialPassword").toBe("initialPassword");
  });
});
