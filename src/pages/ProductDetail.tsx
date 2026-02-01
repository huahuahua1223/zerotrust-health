import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Clock,
  Coins,
  TrendingUp,
  User,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types";

// Mock product data
const mockProducts: Record<string, Product> = {
  "1": {
    id: 1n,
    name: "Basic Health Plan",
    description: "Essential coverage for common illnesses and treatments. Perfect for individuals seeking basic protection. Includes outpatient care, prescription drugs, and emergency services.",
    premium: 100_000000n,
    coverageAmount: 10000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 50000_000000n,
  },
  "2": {
    id: 2n,
    name: "Premium Health Plan",
    description: "Comprehensive coverage including major surgeries, cancer treatment, and chronic disease management. Best for those seeking complete protection.",
    premium: 500_000000n,
    coverageAmount: 100000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 250000_000000n,
  },
};

type PurchaseStep = "idle" | "approve" | "approving" | "buy" | "buying" | "success";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [showPurchaseDialog, setShowPurchaseDialog] = useState(
    searchParams.get("buy") === "true"
  );
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("idle");

  const product = mockProducts[id || "1"] || mockProducts["1"];

  const formatUSDT = (value: bigint) => {
    return parseFloat(formatUnits(value, 6)).toLocaleString();
  };

  const formatDays = (seconds: bigint) => {
    return Math.floor(Number(seconds) / 86400);
  };

  const poolPercentage = Number(
    (product.poolBalance * 100n) / (product.coverageAmount * 10n)
  );

  const handlePurchase = async () => {
    if (!isConnected) {
      toast({
        title: t("productDetail.walletRequired"),
        description: t("productDetail.walletRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setPurchaseStep("approve");

    // Simulate approve transaction
    setTimeout(() => {
      setPurchaseStep("approving");
      setTimeout(() => {
        setPurchaseStep("buy");
        setTimeout(() => {
          setPurchaseStep("buying");
          setTimeout(() => {
            setPurchaseStep("success");
            toast({
              title: t("productDetail.purchaseSuccessful"),
              description: t("productDetail.policyActive"),
            });
          }, 2000);
        }, 500);
      }, 2000);
    }, 500);
  };

  const resetPurchase = () => {
    setPurchaseStep("idle");
    setShowPurchaseDialog(false);
  };

  const coverageItems = [
    t("productDetail.coverageItems.hospitalization"),
    t("productDetail.coverageItems.outpatient"),
    t("productDetail.coverageItems.prescription"),
    t("productDetail.coverageItems.diagnostic"),
    t("productDetail.coverageItems.emergency"),
  ];

  return (
    <div className="container py-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-primary" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <p className="mt-2 text-muted-foreground">{product.description}</p>
                </div>
                {product.isActive ? (
                  <Badge className="bg-success/10 text-success">{t("common.active")}</Badge>
                ) : (
                  <Badge variant="secondary">{t("common.inactive")}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="h-4 w-4" />
                    {t("products.premium")}
                  </div>
                  <div className="text-xl font-bold text-primary">
                    ${formatUSDT(product.premium)}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    {t("products.coverage")}
                  </div>
                  <div className="text-xl font-bold">
                    ${formatUSDT(product.coverageAmount)}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t("products.duration")}
                  </div>
                  <div className="text-xl font-bold">
                    {formatDays(product.duration)} {t("products.days")}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {t("productDetail.insurer")}
                  </div>
                  <div className="truncate text-sm font-mono">
                    {product.insurer.slice(0, 6)}...{product.insurer.slice(-4)}
                  </div>
                </div>
              </div>

              {/* Pool Balance */}
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    {t("products.poolBalance")}
                  </div>
                  <span className="text-lg font-bold text-accent">
                    ${formatUSDT(product.poolBalance)}
                  </span>
                </div>
                <Progress value={poolPercentage} className="h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {poolPercentage.toFixed(1)}% {t("productDetail.ofMaxCapacity")}
                </p>
              </div>

              {/* Coverage Details */}
              <div>
                <h3 className="mb-3 font-semibold">{t("productDetail.whatsCovered")}</h3>
                <ul className="space-y-2">
                  {coverageItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{t("productDetail.purchasePolicy")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("products.premium")}</span>
                  <span className="font-medium">${formatUSDT(product.premium)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("products.coverage")}</span>
                  <span className="font-medium">${formatUSDT(product.coverageAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("products.duration")}</span>
                  <span className="font-medium">{formatDays(product.duration)} {t("products.days")}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="mb-4 flex justify-between">
                  <span className="font-semibold">{t("productDetail.total")}</span>
                  <span className="text-xl font-bold text-primary">
                    ${formatUSDT(product.premium)}
                  </span>
                </div>

                <Button
                  className="w-full gap-2 bg-gradient-primary hover:opacity-90"
                  size="lg"
                  onClick={() => setShowPurchaseDialog(true)}
                  disabled={!product.isActive}
                >
                  <Shield className="h-4 w-4" />
                  {t("products.buyNow")}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {t("productDetail.byPurchasing")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("productDetail.purchaseInsurance")}</DialogTitle>
            <DialogDescription>
              {t("productDetail.completePurchase")} {product.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    purchaseStep === "idle"
                      ? "bg-muted text-muted-foreground"
                      : purchaseStep === "approve" || purchaseStep === "approving"
                      ? "bg-primary text-primary-foreground"
                      : "bg-success text-success-foreground"
                  }`}
                >
                  {purchaseStep === "approving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : purchaseStep === "buy" ||
                    purchaseStep === "buying" ||
                    purchaseStep === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    "1"
                  )}
                </div>
                <span className="text-sm">{t("productDetail.approveUsdt")}</span>
              </div>

              <div className="h-px w-8 bg-border" />

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    purchaseStep === "idle" ||
                    purchaseStep === "approve" ||
                    purchaseStep === "approving"
                      ? "bg-muted text-muted-foreground"
                      : purchaseStep === "buy" || purchaseStep === "buying"
                      ? "bg-primary text-primary-foreground"
                      : "bg-success text-success-foreground"
                  }`}
                >
                  {purchaseStep === "buying" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : purchaseStep === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    "2"
                  )}
                </div>
                <span className="text-sm">{t("productDetail.buyPolicy")}</span>
              </div>
            </div>

            {/* Status message */}
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              {purchaseStep === "idle" && (
                <p>{t("productDetail.clickToStart")}</p>
              )}
              {purchaseStep === "approve" && (
                <p>{t("productDetail.confirmApproval")}</p>
              )}
              {purchaseStep === "approving" && (
                <p className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("productDetail.waitingApproval")}
                </p>
              )}
              {purchaseStep === "buy" && (
                <p>{t("productDetail.confirmPurchase")}</p>
              )}
              {purchaseStep === "buying" && (
                <p className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("productDetail.processingPurchase")}
                </p>
              )}
              {purchaseStep === "success" && (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <p className="font-semibold text-success">{t("productDetail.purchaseSuccessful")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("productDetail.policyActive")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            {purchaseStep === "success" ? (
              <Button asChild className="w-full">
                <Link to="/my-policies" onClick={resetPurchase}>
                  {t("productDetail.viewMyPolicies")}
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={resetPurchase}
                  disabled={
                    purchaseStep === "approving" || purchaseStep === "buying"
                  }
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={
                    purchaseStep === "approving" ||
                    purchaseStep === "buying" ||
                    !isConnected
                  }
                  className="gap-2"
                >
                  {purchaseStep === "idle" && t("productDetail.startPurchase")}
                  {purchaseStep === "approve" && t("productDetail.waitingWallet")}
                  {purchaseStep === "approving" && t("productDetail.approving")}
                  {purchaseStep === "buy" && t("productDetail.waitingWallet")}
                  {purchaseStep === "buying" && t("productDetail.purchasing")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
