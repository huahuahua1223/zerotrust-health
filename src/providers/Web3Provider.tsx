import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { hardhat, sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Get project ID from environment
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "demo-project-id";

// Define supported networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [hardhat, sepolia];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "ZK Medical Insurance",
    description: "Privacy-preserving medical insurance using zero-knowledge proofs",
    url: typeof window !== "undefined" ? window.location.origin : "https://zk-medical-insurance.app",
    icons: ["/favicon.ico"],
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: "light",
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

// Export wagmi config for use in hooks
export const wagmiConfig = wagmiAdapter.wagmiConfig;

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
