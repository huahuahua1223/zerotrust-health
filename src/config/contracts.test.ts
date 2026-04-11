import { describe, expect, it } from "vitest";
import { SEPOLIA_CHAIN_ID } from "@/config/network";
import { resolveContractChainId } from "@/config/contracts";

describe("contract chain resolution", () => {
  it("uses the connected supported chain", () => {
    expect(resolveContractChainId(SEPOLIA_CHAIN_ID, true)).toBe(SEPOLIA_CHAIN_ID);
  });

  it("throws for unsupported production chains", () => {
    expect(() => resolveContractChainId(1, true)).toThrow("Unsupported chain");
  });
});
