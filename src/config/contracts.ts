// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Hardhat local network
  31337: {
    InsuranceManager: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    MockUSDT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    ClaimVerifier: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  // Sepolia testnet
  11155111: {
    InsuranceManager: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
    MockUSDT: "0x0000000000000000000000000000000000000000",
    ClaimVerifier: "0x0000000000000000000000000000000000000000",
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

export const DEFAULT_CHAIN_ID: SupportedChainId = 31337;

export function getContractAddress(
  chainId: number | undefined,
  contractName: keyof (typeof CONTRACT_ADDRESSES)[31337]
): `0x${string}` {
  const id = (chainId || DEFAULT_CHAIN_ID) as SupportedChainId;
  const addresses = CONTRACT_ADDRESSES[id] || CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID];
  return addresses[contractName] as `0x${string}`;
}
