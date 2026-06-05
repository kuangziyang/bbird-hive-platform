import { describe, expect, it } from "vitest";
import { loadOpenApiContract } from "../../support/openapi-contract";

const contract = loadOpenApiContract();

describe("修改密码契约", () => {
  it("包含 /auth/password", () => {
    expect(contract.paths["/auth/password"].put.operationId).toBe("changePassword");
  });
});
