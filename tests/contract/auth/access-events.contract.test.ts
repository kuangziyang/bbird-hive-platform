import { describe, expect, it } from "vitest";
import { loadOpenApiContract } from "../../support/openapi-contract";

const contract = loadOpenApiContract();

describe("访问事件契约", () => {
  it("包含访问事件查询接口", () => {
    expect(contract.paths["/admin/access-events"].get.operationId).toBe("listAccessEvents");
  });
});
