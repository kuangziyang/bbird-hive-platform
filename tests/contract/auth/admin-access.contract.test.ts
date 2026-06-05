import { describe, expect, it } from "vitest";
import { loadOpenApiContract } from "../../support/openapi-contract";

const contract = loadOpenApiContract();

describe("管理端访问契约", () => {
  it("包含管理员账号创建接口", () => {
    expect(contract.paths["/admin/users"].post.operationId).toBe("createUser");
  });
});
