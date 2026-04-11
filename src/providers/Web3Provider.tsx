import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { APPKIT_NETWORKS } from "@/config/network";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "demo-project-id";

const wagmiAdapter = new WagmiAdapter({
  networks: APPKIT_NETWORKS,
  projectId,
  ssr: false,
});

let hasInitializedAppKit = false;
let appKitInitError: Error | null = null;

function initializeAppKit() {
  if (hasInitializedAppKit || appKitInitError || typeof window === "undefined") {
    return;
  }

  try {
    createAppKit({
      adapters: [wagmiAdapter],
      networks: APPKIT_NETWORKS,
      projectId,
      metadata: {
        name: "ZK Medical Insurance",
        description: "Privacy-preserving medical insurance using zero-knowledge proofs",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://zk-medical-insurance.app",
        icons: ["/favicon.ico"],
      },
      features: {
        analytics: true,
        email: false,
        socials: false,
      },
      themeMode: "light",
    });
    hasInitializedAppKit = true;
  } catch (error) {
    appKitInitError =
      error instanceof Error ? error : new Error("Unknown AppKit initialization error");
    console.error("Failed to initialize AppKit:", appKitInitError);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  initializeAppKit();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
