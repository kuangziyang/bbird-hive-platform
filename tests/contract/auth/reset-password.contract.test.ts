import { describe, expect, it } from "vitest";
import { loadOpenApiContract } from "../../support/openapi-contract";

const contract = loadOpenApiContract();

describe("重置密码契约", () => {
  it("包含管理员重置密码接口", () => {
    expect(contract.paths["/admin/users/{userId}/password-reset"].post.operationId).toBe("resetPassword");
  });
});
