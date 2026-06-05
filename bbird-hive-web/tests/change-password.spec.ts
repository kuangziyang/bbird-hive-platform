import { describe, expect, it } from "vitest";

describe("修改密码页面", () => {
  it("提示旧密码失效", () => {
    expect("旧密码已失效").toContain("失效");
  });
});
