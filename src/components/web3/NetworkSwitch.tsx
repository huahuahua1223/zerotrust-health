import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function NetworkSwitch() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  if (!isConnected) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => open({ view: "Networks" })}
      className="hidden gap-1 sm:flex"
    >
      <div className="h-2 w-2 rounded-full bg-success" />
      {caipNetwork?.name || "Unknown"}
      <ChevronDown className="h-3 w-3" />
    </Button>
  );
}
