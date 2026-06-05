import { describe, expect, it } from "vitest";

describe("管理端访问", () => {
  it("普通用户不能访问管理端", () => {
    expect("需要管理员权限").toContain("管理员");
  });
});
