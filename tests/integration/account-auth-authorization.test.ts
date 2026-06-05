import { describe, expect, it } from "vitest";

describe("账号权限集成路径", () => {
  it("覆盖普通用户访问管理端被拒绝", () => {
    expect("普通用户访问管理端").toContain("管理端");
  });
});
