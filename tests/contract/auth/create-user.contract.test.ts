import { describe, expect, it } from "vitest";
import { loadOpenApiContract } from "../../support/openapi-contract";

const contract = loadOpenApiContract();

describe("创建账号契约", () => {
  it("创建账号响应包含 initialPassword", () => {
    const schema = contract.components.schemas.CreateUserResponse;
    expect(schema.required).toContain("initialPassword");
  });
});
