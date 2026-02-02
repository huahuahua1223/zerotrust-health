import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Wallet, User, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WalletButton() {
  const { t } = useTranslation();
  const { open } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => open({ view: "Account" })}
        className="gap-2"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{formatAddress(address)}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => open({ view: "Connect" })}
      className="gap-2 bg-gradient-primary hover:opacity-90"
      disabled={status === "connecting"}
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">
        {status === "connecting" ? t("common.connecting") : t("common.connectWallet")}
      </span>
    </Button>
  );
}
