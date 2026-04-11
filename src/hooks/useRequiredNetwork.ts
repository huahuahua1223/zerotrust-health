import { useAppKit } from "@reown/appkit/react";
import { useAccount, useSwitchChain } from "wagmi";
import {
  getChainDisplayName,
  IS_PRODUCTION,
  isAllowedWalletChain,
  REQUIRED_CHAIN_ID,
} from "@/config/network";

export interface RequiredNetworkState {
  requiredChainId: number;
  currentChainId: number | undefined;
  currentChainName: string;
  requiredChainName: string;
  isWrongNetwork: boolean;
  openNetworkPicker: () => void;
  switchToRequiredChain: () => Promise<boolean>;
}

export function useRequiredNetwork(): RequiredNetworkState {
  const { open } = useAppKit();
  const { chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const isWrongNetwork =
    IS_PRODUCTION && isConnected && !isAllowedWalletChain(chainId, IS_PRODUCTION);

  return {
    requiredChainId: REQUIRED_CHAIN_ID,
    currentChainId: chainId,
    currentChainName: getChainDisplayName(chainId),
    requiredChainName: getChainDisplayName(REQUIRED_CHAIN_ID),
    isWrongNetwork,
    openNetworkPicker: () => open({ view: "Networks" }),
    switchToRequiredChain: async () => {
      try {
        await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
        return true;
      } catch (error) {
        console.error("Failed to switch to required chain:", error);
        return false;
      }
    },
  };
}
