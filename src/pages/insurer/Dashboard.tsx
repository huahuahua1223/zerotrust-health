import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import {
  Package,
  FileText,
  Shield,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useUserRoles, useProducts, useClaimsByPage } from "@/hooks";
import { ClaimStatus, type Product, type Claim } from "@/types";
import { getContractAddress } from "@/config/contracts";
import { ZK_MEDICAL_INSURANCE_ABI } from "@/config/abis";

export default function InsurerDashboard() {
  const { isConnected, address, chainId } = useAccount();
  const { t } = useTranslation();
  const { isLoading: rolesLoading } = useUserRoles();

  const { products, isLoading: productsLoading } = useProducts();
  const { claims, isLoading: claimsLoading } = useClaimsByPage();

  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  const { data: policiesCount } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "policiesCount",
  });

  // Filter products by current insurer
  const myProducts = products?.filter((p: Product) => p.insurer.toLowerCase() === address?.toLowerCase()) || [];

  // Total pool balance = sum of my products' pool balances (useProducts 已包含 poolBalance)
  const totalPoolBalance = myProducts.reduce((sum: bigint, p: Product) => sum + (p.poolBalance ?? 0n), 0n);
  
  // Get pending claims (Submitted or Verified)
  const pendingClaims = claims?.filter((c: Claim) => c.status === ClaimStatus.Submitted || c.status === ClaimStatus.Verified) || [];
  const recentClaims = claims?.slice(0, 3) || [];

  const formatUSDT = (value: bigint) => {
    // 使用 6 位精度（当前 MockERC20 合约的实际精度）
    const formatted = formatUnits(value, 6);
    const num = Number(formatted);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const isLoading = rolesLoading || productsLoading || claimsLoading;

  const stats = [
    {
      title: t("insurer.myProducts"),
      value: myProducts.length,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: t("insurer.activePolicies"),
      value: policiesCount != null ? Number(policiesCount) : "—",
      icon: Shield,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: t("insurer.pendingClaims"),
      value: pendingClaims.length,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: t("insurer.totalPoolBalance"),
      value: `$${formatUSDT(totalPoolBalance)}`,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return <Badge className="bg-warning/10 text-warning">{t("insurer.pendingReview")}</Badge>;
      case ClaimStatus.Verified:
        return <Badge className="bg-primary/10 text-primary">{t("insurer.zkVerified")}</Badge>;
      default:
        return <Badge variant="secondary">{t("common.unknown")}</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
          <p className="text-muted-foreground">{t("insurer.connectToAccess")}</p>
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
        <h1 className="mb-2 font-display text-3xl font-bold">{t("insurer.dashboard")}</h1>
        <p className="text-muted-foreground">
          {t("insurer.dashboardSubtitle")}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-8 w-20" />
                  ) : (
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card className="card-hover bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t("insurer.createProduct")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("insurer.launchProduct")}
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/insurer/products/new">{t("common.create")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <FileText className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t("insurer.claims")}</h3>
                <p className="text-sm text-muted-foreground">
                  {pendingClaims.length} {t("insurer.claimsAwaiting")}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/insurer/claims">{t("common.review")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t("insurer.fundPool")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("insurer.addFunds")}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/insurer/products">{t("common.manage")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Claims */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("insurer.recentClaims")}</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/insurer/claims">
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : recentClaims.length > 0 ? (
              <div className="space-y-4">
                {recentClaims.map((claim: Claim) => (
                  <div
                    key={claim.id.toString()}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{t("common.claimPrefix")}{claim.id.toString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.claimant.slice(0, 6)}...{claim.claimant.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${formatUSDT(claim.amount)}</p>
                        {getStatusBadge(claim.status)}
                      </div>
                      <Button asChild size="sm">
                        <Link to={`/insurer/claims/${claim.id.toString()}`}>{t("common.review")}</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">{t("insurer.noClaimsYet")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
