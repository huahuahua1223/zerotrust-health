import { http, createConfig } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// Reown/WalletConnect Project ID
// You need to get this from https://cloud.reown.com/
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "demo-project-id";

// Supported chains
export const supportedChains = [hardhat, sepolia] as const;

// Wagmi config
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "ZK Medical Insurance",
        description: "Privacy-preserving medical insurance using zero-knowledge proofs",
        url: "https://zk-medical-insurance.app",
        icons: ["https://zk-medical-insurance.app/logo.png"],
      },
    }),
  ],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
  },
});

export { projectId };
