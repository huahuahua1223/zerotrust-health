import { useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  UserPlus,
  UserMinus,
  Search,
  AlertCircle,
  Loader2,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useGrantInsurerRole, useRevokeInsurerRole, useUserRoles } from "@/hooks";

export default function AdminRoles() {
  const { isConnected, address } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<"insurer">("insurer");

  const { isAdmin } = useUserRoles();
  const { grantInsurerRole, isPending: isGranting, isConfirming: isGrantConfirming } = useGrantInsurerRole();
  const { revokeInsurerRole, isPending: isRevoking, isConfirming: isRevokeConfirming } = useRevokeInsurerRole();

  const isProcessing = isGranting || isGrantConfirming || isRevoking || isRevokeConfirming;

  const handleGrantRole = async () => {
    if (!newAddress) return;
    
    try {
      await grantInsurerRole(newAddress as `0x${string}`);
      toast({
        title: t("admin.roleGranted"),
        description: `${selectedRole} ${t("admin.roleGrantedDesc")} ${newAddress.slice(0, 10)}...`,
      });
      setShowGrantDialog(false);
      setNewAddress("");
    } catch (err) {
      toast({
        title: t("errors.transactionFailed"),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleRevokeRole = async (userAddress: `0x${string}`) => {
    try {
      await revokeInsurerRole(userAddress);
      toast({
        title: t("admin.roleRevoked"),
        description: `Insurer ${t("admin.roleRevokedDesc")} ${userAddress.slice(0, 10)}...`,
      });
    } catch (err) {
      toast({
        title: t("errors.transactionFailed"),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
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
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 font-display text-3xl font-bold">{t("admin.roles")}</h1>
          <p className="text-muted-foreground">
            {t("admin.rolesSubtitle")}
          </p>
        </div>
        <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary hover:opacity-90">
              <UserPlus className="h-4 w-4" />
              {t("admin.grantRole")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.grantRole")}</DialogTitle>
              <DialogDescription>
                {t("admin.grantRoleDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("admin.walletAddress")}</Label>
                <Input
                  placeholder="0x..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.role")}</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as "insurer")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insurer">{t("admin.insurerRole")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleGrantRole} disabled={isProcessing || !newAddress}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("admin.grantRole")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t("admin.roleManagement")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("admin.roleManagementDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grant Role Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("admin.grantInsurerRole")}
            </CardTitle>
            <CardDescription>
              {t("admin.grantInsurerRoleDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder={t("admin.enterWalletAddress")}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleGrantRole}
                  disabled={isProcessing || !newAddress}
                  className="gap-2"
                >
                  {isGranting || isGrantConfirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {t("admin.grantRole")}
                </Button>
              </div>
              
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {t("admin.grantRoleNote")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revoke Role Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <UserMinus className="h-5 w-5" />
              {t("admin.revokeInsurerRole")}
            </CardTitle>
            <CardDescription>
              {t("admin.revokeInsurerRoleDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder={t("admin.enterWalletAddress")}
                  className="flex-1"
                  id="revoke-address"
                />
                <Button 
                  variant="destructive"
                  onClick={() => {
                    const input = document.getElementById("revoke-address") as HTMLInputElement;
                    if (input.value) {
                      handleRevokeRole(input.value as `0x${string}`);
                    }
                  }}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isRevoking || isRevokeConfirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                  {t("admin.revokeRole")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
