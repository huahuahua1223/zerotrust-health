import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Pause,
  Play,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Info,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles, usePauseContract, useUnpauseContract, useSetVerifier } from "@/hooks";
import { getContractAddress } from "@/config/contracts";
import { ZK_MEDICAL_INSURANCE_ABI } from "@/config/abis";

function getExplorerAddressUrl(chainId: number | undefined, address: string): string | null {
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/address/${address}`;
  }
  return null;
}

export default function AdminSystem() {
  const { isConnected, chainId } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showVerifierDialog, setShowVerifierDialog] = useState(false);
  const [newVerifierAddress, setNewVerifierAddress] = useState("");

  const { isAdmin } = useUserRoles();

  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  const { data: paused, refetch: refetchPaused } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "paused",
  });
  const isPaused = paused === true;

  const { pause, isPending: isPausePending, isSuccess: isPauseSuccess, error: pauseError } = usePauseContract();
  const { unpause, isPending: isUnpausePending, isSuccess: isUnpauseSuccess, error: unpauseError } = useUnpauseContract();
  const { setVerifier, isPending: isSetVerifierPending, isSuccess: isSetVerifierSuccess, error: setVerifierError } = useSetVerifier();

  const isProcessing = isPausePending || isUnpausePending || isSetVerifierPending;

  useEffect(() => {
    if (isPauseSuccess || isUnpauseSuccess) {
      refetchPaused();
      setShowPauseDialog(false);
      toast({
        title: isPauseSuccess ? t("adminSystem.contractPaused") : t("adminSystem.contractResumed"),
        description: isPauseSuccess ? t("adminSystem.contractPausedDesc") : t("adminSystem.contractResumedDesc"),
      });
    }
  }, [isPauseSuccess, isUnpauseSuccess, refetchPaused, t, toast]);

  useEffect(() => {
    if (pauseError) {
      toast({
        title: t("errors.transactionFailed"),
        description: pauseError.message,
        variant: "destructive",
      });
    }
    if (unpauseError) {
      toast({
        title: t("errors.transactionFailed"),
        description: unpauseError.message,
        variant: "destructive",
      });
    }
    if (setVerifierError) {
      toast({
        title: t("errors.transactionFailed"),
        description: setVerifierError.message,
        variant: "destructive",
      });
    }
  }, [pauseError, unpauseError, setVerifierError, t, toast]);

  const handlePauseToggle = async () => {
    try {
      if (isPaused) {
        await unpause();
      } else {
        await pause();
      }
    } catch {
      // Error handled in useEffect
    }
  };

  const handleUpdateVerifier = async () => {
    const addr = newVerifierAddress.trim() as `0x${string}`;
    if (!addr || !addr.startsWith("0x")) return;
    try {
      await setVerifier(addr);
    } catch {
      // Error handled in useEffect
    }
  };

  useEffect(() => {
    if (isSetVerifierSuccess) {
      const savedAddr = newVerifierAddress;
      setShowVerifierDialog(false);
      setNewVerifierAddress("");
      toast({
        title: t("adminSystem.verifierUpdated"),
        description: savedAddr ? `${t("adminSystem.verifierUpdatedDesc")} ${savedAddr.slice(0, 10)}...` : t("adminSystem.verifierUpdatedDesc"),
      });
    }
  }, [isSetVerifierSuccess, t, toast, newVerifierAddress]);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({ title: t("adminSystem.copied") });
    } catch {
      toast({ title: t("adminSystem.copyFailed"), variant: "destructive" });
    }
  };

  // Contract addresses from config
  const contractInfo = {
    address: insuranceManagerAddress,
    verifier: getContractAddress(chainId, "ClaimVerifier"),
    usdt: getContractAddress(chainId, "MockUSDT"),
    network: chainId === 31337 ? t("adminSystem.networkHardhat") : chainId === 11155111 ? t("adminSystem.networkSepolia") : t("adminSystem.networkUnknown"),
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.accessDenied")}</h2>
          <p className="text-muted-foreground">{t("errors.adminRequired")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="mb-2 font-display text-3xl font-bold">{t("admin.system")}</h1>
        <p className="text-muted-foreground">
          {t("admin.systemSubtitle")}
        </p>
      </motion.div>

      {/* Pause Warning */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t("adminSystem.contractPaused")}</AlertTitle>
            <AlertDescription>
              {t("adminSystem.pausedWarning")}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contract Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("adminSystem.contractStatus")}
              </CardTitle>
              <CardDescription>
                {t("adminSystem.contractStatusDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t("adminSystem.contractStatus")}</span>
                </div>
                {isPaused ? (
                  <Badge variant="destructive">{t("admin.pause")}</Badge>
                ) : (
                  <Badge className="bg-success/10 text-success">{t("adminSystem.contractActive")}</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("adminSystem.network")}</span>
                <span className="text-sm font-medium">{contractInfo.network}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("adminSystem.insuranceManager")}</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">
                    {contractInfo.address.slice(0, 10)}...{contractInfo.address.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopyAddress(contractInfo.address)}
                    aria-label={t("adminSystem.copyAddress")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {getExplorerAddressUrl(chainId, contractInfo.address) && (
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
                      <a
                        href={getExplorerAddressUrl(chainId, contractInfo.address)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("adminSystem.viewOnExplorer")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("adminSystem.zkVerifier")}</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">
                    {contractInfo.verifier.slice(0, 10)}...{contractInfo.verifier.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopyAddress(contractInfo.verifier)}
                    aria-label={t("adminSystem.copyAddress")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {getExplorerAddressUrl(chainId, contractInfo.verifier) && (
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
                      <a
                        href={getExplorerAddressUrl(chainId, contractInfo.verifier)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("adminSystem.viewOnExplorer")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("adminSystem.usdtToken")}</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">
                    {contractInfo.usdt.slice(0, 10)}...{contractInfo.usdt.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopyAddress(contractInfo.usdt)}
                    aria-label={t("adminSystem.copyAddress")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {getExplorerAddressUrl(chainId, contractInfo.usdt) && (
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
                      <a
                        href={getExplorerAddressUrl(chainId, contractInfo.usdt)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("adminSystem.viewOnExplorer")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("adminSystem.emergencyControls")}
              </CardTitle>
              <CardDescription>
                {t("adminSystem.emergencyControlsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium">
                    {isPaused ? t("admin.unpause") : t("admin.pause")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPaused
                      ? t("adminSystem.resumeDesc")
                      : t("adminSystem.pauseDesc")}
                  </p>
                </div>
                <Button
                  variant={isPaused ? "default" : "destructive"}
                  onClick={() => setShowPauseDialog(true)}
                  className="gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      {t("adminSystem.resume")}
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      {t("admin.pause")}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium">{t("adminSystem.updateVerifier")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("adminSystem.updateVerifierDesc")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowVerifierDialog(true)}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("adminSystem.update")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{t("adminSystem.adminPermissions")}</AlertTitle>
            <AlertDescription>
              {t("adminSystem.adminPermissionsDesc")}
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPaused ? t("adminSystem.resumeConfirmTitle") : t("adminSystem.pauseConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {isPaused
                ? t("adminSystem.resumeConfirmDesc")
                : t("adminSystem.pauseConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant={isPaused ? "default" : "destructive"}
              onClick={handlePauseToggle}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : isPaused ? (
                t("adminSystem.resumeContract")
              ) : (
                t("adminSystem.pauseContract")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verifier Dialog */}
      <Dialog open={showVerifierDialog} onOpenChange={setShowVerifierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminSystem.updateVerifierTitle")}</DialogTitle>
            <DialogDescription>
              {t("adminSystem.updateVerifierModalDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>{t("adminSystem.currentVerifier")}</Label>
              <Input value={contractInfo.verifier} disabled />
            </div>
            <div className="mt-4 space-y-2">
              <Label>{t("adminSystem.newVerifierAddress")}</Label>
              <Input
                placeholder="0x..."
                value={newVerifierAddress}
                onChange={(e) => setNewVerifierAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifierDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdateVerifier}
              disabled={isProcessing || !newVerifierAddress}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("adminSystem.updating")}
                </>
              ) : (
                t("adminSystem.updateVerifier")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
