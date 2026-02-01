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
  CheckCircle2,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useI18n } from "@/locales";
import { useToast } from "@/hooks/use-toast";

export default function AdminSystem() {
  const { isConnected } = useAccount();
  const { t } = useI18n();
  const { toast } = useToast();

  const [isPaused, setIsPaused] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showVerifierDialog, setShowVerifierDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newVerifierAddress, setNewVerifierAddress] = useState("");

  // Mock contract info
  const contractInfo = {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    verifier: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    usdt: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    network: "Hardhat Local",
  };

  const handlePauseToggle = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Contract Resumed" : "Contract Paused",
      description: isPaused
        ? "The contract is now operational."
        : "All contract operations have been paused.",
    });
    setIsProcessing(false);
    setShowPauseDialog(false);
  };

  const handleUpdateVerifier = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Verifier Updated",
      description: `ZK verifier contract has been updated to ${newVerifierAddress.slice(0, 10)}...`,
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
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
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
        <h1 className="mb-2 font-display text-3xl font-bold">{t.admin.system}</h1>
        <p className="text-muted-foreground">
          Manage system settings and contract configurations.
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
            <AlertTitle>Contract Paused</AlertTitle>
            <AlertDescription>
              All contract operations are currently paused. Users cannot purchase policies or submit claims.
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
                Contract Status
              </CardTitle>
              <CardDescription>
                Current state of the insurance manager contract.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Contract Status</span>
                </div>
                {isPaused ? (
                  <Badge variant="destructive">Paused</Badge>
                ) : (
                  <Badge className="bg-success/10 text-success">Active</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm font-medium">{contractInfo.network}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Insurance Manager</span>
                <span className="font-mono text-xs">
                  {contractInfo.address.slice(0, 10)}...{contractInfo.address.slice(-8)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ZK Verifier</span>
                <span className="font-mono text-xs">
                  {contractInfo.verifier.slice(0, 10)}...{contractInfo.verifier.slice(-8)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">USDT Token</span>
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
                Emergency Controls
              </CardTitle>
              <CardDescription>
                Critical actions for contract management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium">
                    {isPaused ? t.admin.unpause : t.admin.pause}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPaused
                      ? "Resume all contract operations"
                      : "Pause all contract operations in case of emergency"}
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
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium">Update ZK Verifier</p>
                  <p className="text-sm text-muted-foreground">
                    Update the zero-knowledge proof verifier contract
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowVerifierDialog(true)}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Update
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
            <AlertTitle>Admin Permissions</AlertTitle>
            <AlertDescription>
              As an admin, you have full control over the contract. Use these powers responsibly.
              All actions are recorded on the blockchain and are irreversible.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPaused ? "Resume Contract?" : "Pause Contract?"}
            </DialogTitle>
            <DialogDescription>
              {isPaused
                ? "This will resume all contract operations. Users will be able to purchase policies and submit claims again."
                : "This will pause all contract operations. Users will not be able to purchase policies or submit claims until resumed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant={isPaused ? "default" : "destructive"}
              onClick={handlePauseToggle}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isPaused ? (
                "Resume Contract"
              ) : (
                "Pause Contract"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verifier Dialog */}
      <Dialog open={showVerifierDialog} onOpenChange={setShowVerifierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update ZK Verifier</DialogTitle>
            <DialogDescription>
              Enter the address of the new ZK proof verifier contract.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Current Verifier</Label>
              <Input value={contractInfo.verifier} disabled />
            </div>
            <div className="mt-4 space-y-2">
              <Label>New Verifier Address</Label>
              <Input
                placeholder="0x..."
                value={newVerifierAddress}
                onChange={(e) => setNewVerifierAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifierDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleUpdateVerifier}
              disabled={isProcessing || !newVerifierAddress}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Verifier"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
