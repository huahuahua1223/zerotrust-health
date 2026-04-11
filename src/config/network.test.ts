import { describe, expect, it } from "vitest";
import {
  getAppKitNetworks,
  HARDHAT_CHAIN_ID,
  resolveDefaultChainId,
  SEPOLIA_CHAIN_ID,
} from "@/config/network";

describe("network config", () => {
  it("uses only sepolia in production", () => {
    const networks = getAppKitNetworks(true);

    expect(networks).toHaveLength(1);
    expect(networks[0].id).toBe(SEPOLIA_CHAIN_ID);
  });

  it("keeps hardhat and sepolia in development", () => {
    const networks = getAppKitNetworks(false);

    expect(networks.map((network) => network.id)).toEqual([
      HARDHAT_CHAIN_ID,
      SEPOLIA_CHAIN_ID,
    ]);
  });

  it("defaults to sepolia in production", () => {
    expect(resolveDefaultChainId(true, HARDHAT_CHAIN_ID)).toBe(SEPOLIA_CHAIN_ID);
  });
});
