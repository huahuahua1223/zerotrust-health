import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  UserPlus,
  UserMinus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useGrantRole, useRevokeRole, useUserRoles } from "@/hooks";
import { getContractAddress } from "@/config/contracts";
import { ZK_MEDICAL_INSURANCE_ABI } from "@/config/abis";

export default function AdminRoles() {
  const { isConnected, chainId } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [newAddress, setNewAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<"insurer">("insurer");

  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  const { data: insurerRole } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "INSURER_ROLE",
  });
  const INSURER_ROLE = insurerRole as `0x${string}` | undefined;

  const { isAdmin } = useUserRoles();
  const { grantRole, isPending: isGranting, isConfirming: isGrantConfirming } = useGrantRole();
  const { revokeRole, isPending: isRevoking, isConfirming: isRevokeConfirming } = useRevokeRole();

  const isProcessing = isGranting || isGrantConfirming || isRevoking || isRevokeConfirming;

  const handleGrantRole = async () => {
    if (!newAddress || !INSURER_ROLE) return;
    
    try {
      await grantRole(INSURER_ROLE, newAddress as `0x${string}`);
      toast({
        title: t("admin.roleGranted"),
        description: `${selectedRole} ${t("admin.roleGrantedDesc")} ${newAddress.slice(0, 10)}...`,
      });
      setNewAddress("");
    } catch (err) {
      toast({
        title: t("errors.transactionFailed"),
        description: err instanceof Error ? err.message : t("errors.unknownError"),
        variant: "destructive",
      });
    }
  };

  const handleRevokeRole = async (userAddress: `0x${string}`) => {
    if (!INSURER_ROLE) return;
    try {
      await revokeRole(INSURER_ROLE, userAddress);
      toast({
        title: t("admin.roleRevoked"),
        description: `${t("admin.insurerRole")} ${t("admin.roleRevokedDesc")} ${userAddress.slice(0, 10)}...`,
      });
    } catch (err) {
      toast({
        title: t("errors.transactionFailed"),
        description: err instanceof Error ? err.message : t("errors.unknownError"),
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
        className="mb-8"
      >
        <h1 className="mb-2 font-display text-3xl font-bold">{t("admin.roles")}</h1>
        <p className="text-muted-foreground">
          {t("admin.rolesSubtitle")}
        </p>
      </motion.div>

      {/* 左右双栏布局 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：授权角色表单 (1列) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t("admin.grantRole")}
            </CardTitle>
            <CardDescription>{t("admin.grantRoleDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("admin.walletAddress")}</Label>
              <Input
                placeholder={t("admin.addressPlaceholder")}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.role")}</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as "insurer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurer">{t("admin.insurerRole")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGrantRole} disabled={isProcessing || !newAddress || !INSURER_ROLE} className="w-full">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("admin.grantRole")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧：角色列表表格 (2列) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("admin.currentRoles")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("admin.roleManagementDesc")}
            </p>
            {/* 这里可以添加一个表格来显示所有具有角色的地址 */}
            {/* 由于当前没有查询所有角色持有者的功能，显示一个占位符 */}
            <div className="rounded-lg border p-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t("admin.roleListPlaceholder")}
              </p>
            </div>
            
            {/* 撤销角色部分 */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <UserMinus className="h-5 w-5" />
                <h3 className="font-semibold">{t("admin.revokeInsurerRole")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("admin.revokeInsurerRoleDesc")}
              </p>
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
                      input.value = "";
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
      </div>
    </div>
  );
}
