import { hardhat, sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const HARDHAT_CHAIN_ID = hardhat.id as 31337;
export const SEPOLIA_CHAIN_ID = sepolia.id as 11155111;

export type SupportedChainId = typeof HARDHAT_CHAIN_ID | typeof SEPOLIA_CHAIN_ID;

const SUPPORTED_CHAIN_IDS = [HARDHAT_CHAIN_ID, SEPOLIA_CHAIN_ID] as const;

export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId);
}

export function resolveDefaultChainId(
  isProduction: boolean,
  envDefaultChainId?: number
): SupportedChainId {
  if (isProduction) {
    return SEPOLIA_CHAIN_ID;
  }

  if (envDefaultChainId !== undefined && isSupportedChainId(envDefaultChainId)) {
    return envDefaultChainId;
  }

  return HARDHAT_CHAIN_ID;
}

export function getAppKitNetworks(isProduction: boolean): [AppKitNetwork, ...AppKitNetwork[]] {
  return isProduction ? [sepolia] : [hardhat, sepolia];
}

export function isAllowedWalletChain(chainId: number | undefined, isProduction: boolean): boolean {
  if (chainId === undefined) {
    return false;
  }

  return isProduction ? chainId === SEPOLIA_CHAIN_ID : isSupportedChainId(chainId);
}

export function getChainDisplayName(chainId: number | undefined): string {
  if (chainId === HARDHAT_CHAIN_ID) {
    return "Hardhat";
  }

  if (chainId === SEPOLIA_CHAIN_ID) {
    return "Sepolia";
  }

  if (chainId === undefined) {
    return "Unknown";
  }

  return `Chain ${chainId}`;
}

export const IS_PRODUCTION = import.meta.env.PROD;
const envDefaultChainId = Number(import.meta.env.VITE_CHAIN_ID);

export const DEFAULT_CHAIN_ID = resolveDefaultChainId(
  IS_PRODUCTION,
  Number.isFinite(envDefaultChainId) ? envDefaultChainId : undefined
);

export const REQUIRED_CHAIN_ID = SEPOLIA_CHAIN_ID;
export const APPKIT_NETWORKS = getAppKitNetworks(IS_PRODUCTION);
