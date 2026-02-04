import { useState } from "react";
import { useAccount } from "wagmi";
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
import { useUserRoles } from "@/hooks";
import { getContractAddress } from "@/config/contracts";

export default function AdminSystem() {
  const { isConnected, chainId } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isPaused, setIsPaused] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showVerifierDialog, setShowVerifierDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newVerifierAddress, setNewVerifierAddress] = useState("");

  const { isAdmin } = useUserRoles();

  // Contract addresses from config
  const contractInfo = {
    address: getContractAddress(chainId, "InsuranceManager"),
    verifier: getContractAddress(chainId, "ClaimVerifier"),
    usdt: getContractAddress(chainId, "MockUSDT"),
    network: chainId === 31337 ? t("adminSystem.networkHardhat") : chainId === 11155111 ? t("adminSystem.networkSepolia") : t("adminSystem.networkUnknown"),
  };

  const handlePauseToggle = async () => {
    setIsProcessing(true);
    // TODO: Implement actual contract call when pause/unpause functions are available
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? t("adminSystem.contractResumed") : t("adminSystem.contractPaused"),
      description: isPaused
        ? t("adminSystem.contractResumedDesc")
        : t("adminSystem.contractPausedDesc"),
    });
    setIsProcessing(false);
    setShowPauseDialog(false);
  };

  const handleUpdateVerifier = async () => {
    setIsProcessing(true);
    // TODO: Implement actual contract call when setVerifier function is available
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: t("adminSystem.verifierUpdated"),
      description: `${t("adminSystem.verifierUpdatedDesc")} ${newVerifierAddress.slice(0, 10)}...`,
    });
    setIsProcessing(false);
    setShowVerifierDialog(false);
    setNewVerifierAddress("");
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
                <span className="font-mono text-xs">
                  {contractInfo.address.slice(0, 10)}...{contractInfo.address.slice(-8)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("adminSystem.zkVerifier")}</span>
                <span className="font-mono text-xs">
                  {contractInfo.verifier.slice(0, 10)}...{contractInfo.verifier.slice(-8)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("adminSystem.usdtToken")}</span>
                <span className="font-mono text-xs">
                  {contractInfo.usdt.slice(0, 10)}...{contractInfo.usdt.slice(-8)}
                </span>
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
