import { describe, expect, it } from "vitest";
import { loadOpenApiContract } from "../../support/openapi-contract";

const contract = loadOpenApiContract();

describe("登录接口契约", () => {
  it("包含 /auth/login", () => {
    expect(contract.paths["/auth/login"].post.operationId).toBe("login");
  });
});
