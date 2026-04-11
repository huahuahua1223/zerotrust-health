import {
  DEFAULT_CHAIN_ID,
  HARDHAT_CHAIN_ID,
  IS_PRODUCTION,
  isSupportedChainId,
  type SupportedChainId,
} from "@/config/network";

export const CONTRACT_ADDRESSES = {
  [HARDHAT_CHAIN_ID]: {
    InsuranceManager: (import.meta.env.VITE_CONTRACT_INSURANCE_MANAGER_31337 ||
      "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`,
    MockUSDT: (import.meta.env.VITE_CONTRACT_MOCK_USDT_31337 ||
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`,
    ClaimVerifier: (import.meta.env.VITE_CONTRACT_VERIFIER_31337 ||
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as `0x${string}`,
  },
  11155111: {
    InsuranceManager: (import.meta.env.VITE_CONTRACT_INSURANCE_MANAGER_11155111 ||
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    MockUSDT: (import.meta.env.VITE_CONTRACT_MOCK_USDT_11155111 ||
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    ClaimVerifier: (import.meta.env.VITE_CONTRACT_VERIFIER_11155111 ||
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
  },
} as const;

export type ContractName = keyof (typeof CONTRACT_ADDRESSES)[typeof HARDHAT_CHAIN_ID];

export function resolveContractChainId(
  chainId: number | undefined,
  isProduction = IS_PRODUCTION
): SupportedChainId {
  if (chainId !== undefined && isSupportedChainId(chainId)) {
    return chainId;
  }

  if (chainId !== undefined && isProduction) {
    throw new Error(`Unsupported chain in production: ${chainId}`);
  }

  return DEFAULT_CHAIN_ID;
}

export function getContractAddress(
  chainId: number | undefined,
  contractName: ContractName
): `0x${string}` {
  const id = resolveContractChainId(chainId);
  return CONTRACT_ADDRESSES[id][contractName] as `0x${string}`;
}
