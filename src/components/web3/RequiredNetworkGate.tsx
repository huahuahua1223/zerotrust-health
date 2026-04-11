import { useState } from "react";
import { AlertTriangle, ArrowRightLeft, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequiredNetwork } from "@/hooks/useRequiredNetwork";

interface WrongNetworkScreenProps {
  currentChainId: number | undefined;
  currentChainName: string;
  requiredChainId: number;
  requiredChainName: string;
  onSwitch: () => Promise<boolean>;
  onOpenNetworks: () => void;
}

export function WrongNetworkScreen({
  currentChainId,
  currentChainName,
  requiredChainId,
  requiredChainName,
  onSwitch,
  onOpenNetworks,
}: WrongNetworkScreenProps) {
  const { t } = useTranslation();
  const [switchFailed, setSwitchFailed] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async () => {
    setSwitchFailed(false);
    setIsSwitching(true);

    const didSwitch = await onSwitch();

    setIsSwitching(false);
    if (!didSwitch) {
      setSwitchFailed(true);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl border-destructive/30 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{t("networkGuard.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("networkGuard.description")}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("networkGuard.currentNetwork")}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {currentChainName}
                {currentChainId !== undefined ? ` (#${currentChainId})` : ""}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("networkGuard.requiredNetwork")}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {requiredChainName} (#{requiredChainId})
              </p>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t("networkGuard.blockedTitle")}</AlertTitle>
            <AlertDescription>{t("networkGuard.blockedDescription")}</AlertDescription>
          </Alert>

          {switchFailed && (
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertTitle>{t("networkGuard.manualSwitchTitle")}</AlertTitle>
              <AlertDescription>{t("networkGuard.manualSwitchDescription")}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleSwitch} disabled={isSwitching} className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              {isSwitching ? t("networkGuard.switching") : t("networkGuard.switchButton")}
            </Button>
            <Button variant="outline" onClick={onOpenNetworks}>
              {t("networkGuard.openNetworksButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface RequiredNetworkGateProps {
  children: React.ReactNode;
}

export function RequiredNetworkGate({ children }: RequiredNetworkGateProps) {
  const {
    currentChainId,
    currentChainName,
    requiredChainId,
    requiredChainName,
    isWrongNetwork,
    openNetworkPicker,
    switchToRequiredChain,
  } = useRequiredNetwork();

  if (!isWrongNetwork) {
    return <>{children}</>;
  }

  return (
    <WrongNetworkScreen
      currentChainId={currentChainId}
      currentChainName={currentChainName}
      requiredChainId={requiredChainId}
      requiredChainName={requiredChainName}
      onSwitch={switchToRequiredChain}
      onOpenNetworks={openNetworkPicker}
    />
  );
}
