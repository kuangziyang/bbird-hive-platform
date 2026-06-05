import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

export function loadOpenApiContract() {
  const contractPath = resolve("specs/002-account-auth/contracts/openapi.yaml");
  return parse(readFileSync(contractPath, "utf8"));
}
