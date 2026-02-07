import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
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
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useProduct, useProductPool, useBuyPolicy, useTokenApprove, useTokenBalance, useTokenDecimals, useTokenAllowance } from "@/hooks";
import { TransactionStatus } from "@/components/web3";
import { getContractAddress } from "@/config/contracts";
import { fetchProductMetadata, type ProductMetadata } from "@/lib/ipfs";

type PurchaseStep = "idle" | "approve" | "approving" | "buy" | "buying" | "success";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isConnected, chainId } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const productId = id ? BigInt(id) : undefined;
  const { product, isLoading, error } = useProduct(productId);
  const { poolBalance: rawPoolBalance } = useProductPool(productId);
  const poolBalance = rawPoolBalance as bigint;
  
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  const { balance: tokenBalance } = useTokenBalance();
  // 使用产品的 token 地址获取精度
  const { decimals: tokenDecimals } = useTokenDecimals(product?.token);
  const { allowance } = useTokenAllowance(insuranceManagerAddress);
  
  const { approve, isPending: isApproving, isConfirming: isApproveConfirming, isSuccess: isApproveSuccess, error: approveError, reset: resetApprove } = useTokenApprove();
  const { buyPolicy, isPending: isBuying, isConfirming: isBuyConfirming, isSuccess: isBuySuccess, hash: buyHash, error: buyError } = useBuyPolicy();

  const [showPurchaseDialog, setShowPurchaseDialog] = useState(
    searchParams.get("buy") === "true"
  );
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("idle");
  const [metadata, setMetadata] = useState<ProductMetadata | null>(null);

  // Handle approve success - move to buy step
  useEffect(() => {
    if (isApproveSuccess && purchaseStep === "approving") {
      setPurchaseStep("buy");
      resetApprove();
    }
  }, [isApproveSuccess, purchaseStep, resetApprove]);

  // Handle buy success
  useEffect(() => {
    if (isBuySuccess && purchaseStep === "buying") {
      setPurchaseStep("success");
      toast({
        title: t("productDetail.purchaseSuccessful"),
        description: t("productDetail.policyActive"),
      });
    }
  }, [isBuySuccess, purchaseStep, toast, t]);

  // Update step based on transaction state
  useEffect(() => {
    if (isApproving || isApproveConfirming) {
      setPurchaseStep("approving");
    }
  }, [isApproving, isApproveConfirming]);

  useEffect(() => {
    if (isBuying || isBuyConfirming) {
      setPurchaseStep("buying");
    }
  }, [isBuying, isBuyConfirming]);

  // 加载产品元数据
  useEffect(() => {
    if (product?.uri) {
      fetchProductMetadata(product.uri)
        .then(setMetadata)
        .catch(err => console.error("Failed to fetch metadata:", err));
    }
  }, [product?.uri]);

  // Error state - 产品不存在时自动重定向（必须在所有条件返回之前）
  useEffect(() => {
    if (!isLoading && !product) {
      const timer = setTimeout(() => {
        navigate("/products", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, product, navigate]);

  const formatUSDT = (value: bigint) => {
    // 使用动态精度（从代币合约获取）
    const decimals = tokenDecimals ?? 6;
    const formatted = formatUnits(value, decimals);
    
    // 直接使用 Number 转换并格式化
    const num = Number(formatted);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // 修复：资金池比例 = poolBalance / maxCoverage * 100%
  const poolPercentage = product && poolBalance ? Number(
    (poolBalance * 100n) / product.maxCoverage
  ) : 0;

  const handlePurchase = () => {
    if (!isConnected || !product) {
      toast({
        title: t("productDetail.walletRequired"),
        description: t("productDetail.walletRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    // Check if we need to approve first
    const needsApproval = !allowance || allowance < product.premiumAmount;
    
    if (needsApproval) {
      setPurchaseStep("approve");
      approve(insuranceManagerAddress, product.premiumAmount);
    } else {
      setPurchaseStep("buy");
      buyPolicy(product.id);
    }
  };

  const handleBuy = () => {
    if (product) {
      buyPolicy(product.id);
    }
  };

  const resetPurchase = () => {
    setPurchaseStep("idle");
    setShowPurchaseDialog(false);
    resetApprove();
  };

  // 从元数据加载保障范围，如果没有则使用默认列表
  const coverageItems = (metadata?.diseases && metadata.diseases.length > 0)
    ? metadata.diseases.map(diseaseId => 
        t(`diseases.${diseaseId}`, { defaultValue: t("common.unknown") + ` #${diseaseId}` })
      )
    : [
        t("productDetail.coverageItems.hospitalization"),
        t("productDetail.coverageItems.outpatient"),
        t("productDetail.coverageItems.prescription"),
        t("productDetail.coverageItems.diagnostic"),
        t("productDetail.coverageItems.emergency"),
      ];

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-6 h-10 w-24" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4 rounded-xl border p-6">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="grid grid-cols-4 gap-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.productNotFound")}</h2>
          <p className="mb-4 max-w-md text-muted-foreground">
            {t("errors.productNotFoundDesc")}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("errors.redirecting")}</span>
          </div>
          <Button
            variant="outline"
            className="mt-6 gap-2"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.backToProducts")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="detail-hero mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="mb-3 font-display text-4xl font-bold">
              {metadata?.name || `${t('products.medicalInsuranceProduct')} #${product.id.toString()}`}
            </h1>
            <p className="text-lg text-muted-foreground">
              {metadata?.description || t('products.comprehensiveCoverage')}
            </p>
          </div>
          {product.active ? (
            <Badge className="flex-shrink-0 bg-success/10 text-success px-4 py-2 text-base">
              {t("common.active")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex-shrink-0 px-4 py-2 text-base">
              {t("common.inactive")}
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="detail-section lg:col-span-2 space-y-6"
        >
          {/* 统计卡片网格 */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* 保费卡片 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
              className="stat-card"
            >
              <div className="stat-card-icon bg-primary/10">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-3">
                <div className="stat-card-label">{t("products.premium")}</div>
                <div className="stat-card-value text-primary">
                  ${formatUSDT(product.premiumAmount)}
                </div>
              </div>
            </motion.div>

            {/* 保额卡片 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
              className="stat-card"
            >
              <div className="stat-card-icon bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div className="mt-3">
                <div className="stat-card-label">{t("products.coverage")}</div>
                <div className="stat-card-value">
                  ${formatUSDT(product.maxCoverage)}
                </div>
              </div>
            </motion.div>

            {/* 保障期卡片 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
              className="stat-card"
            >
              <div className="stat-card-icon bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="mt-3">
                <div className="stat-card-label">{t("products.duration")}</div>
                <div className="stat-card-value">
                  {product.coveragePeriodDays}
                </div>
                <div className="text-sm text-muted-foreground">{t("products.days")}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 资金池可视化卡片 */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t("products.poolBalance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* 圆环进度图 */}
                <div className="relative flex-shrink-0">
                  <svg className="progress-ring" width="140" height="140">
                    {/* 背景圆 */}
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted/30"
                    />
                    {/* 进度圆 */}
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      stroke="url(#poolGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      className="progress-ring-circle"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - poolPercentage / 100)}`}
                    />
                    <defs>
                      <linearGradient id="poolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--success))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* 中心文字 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-primary">
                      {poolPercentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("productDetail.filled")}
                    </div>
                  </div>
                </div>

                {/* 详细数据 */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("productDetail.currentBalance")}</div>
                    <div className="text-2xl font-bold tabular-nums">
                      ${formatUSDT(poolBalance ?? 0n)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("productDetail.maxCapacity")}</div>
                    <div className="text-xl font-semibold tabular-nums text-muted-foreground">
                      ${formatUSDT(product.maxCoverage)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("productDetail.poolExplanation")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保障范围卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>{t("productDetail.whatsCovered")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {coverageItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 承保方信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("productDetail.insurerInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="text-sm text-muted-foreground mb-2">{t("productDetail.insurer")}</div>
                <code className="block rounded bg-muted px-3 py-2 text-sm font-mono">
                  {product.insurer}
                </code>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="sticky top-24 overflow-hidden">
            {/* 顶部装饰条 */}
            <div className="h-1 bg-gradient-to-r from-primary to-success" />
            
            <CardHeader>
              <CardTitle className="text-xl">{t("productDetail.purchasePolicy")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("productDetail.instantCoverage")}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* 价格明细 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{t("products.premium")}</span>
                  <span className="font-semibold tabular-nums">${formatUSDT(product.premiumAmount)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{t("products.coverage")}</span>
                  <span className="font-semibold tabular-nums">${formatUSDT(product.maxCoverage)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{t("products.duration")}</span>
                  <span className="font-semibold">{product.coveragePeriodDays} {t("products.days")}</span>
                </div>
                
                {/* 钱包余额 */}
                {tokenBalance !== undefined && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t("productDetail.yourBalance")}</span>
                      <span className="font-semibold tabular-nums">${formatUSDT(tokenBalance)}</span>
                    </div>
                    {tokenBalance < product.premiumAmount && (
                      <p className="mt-2 text-xs text-destructive">
                        {t("productDetail.insufficientBalance")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 分隔线 */}
              <div className="border-t" />

              {/* 总计 */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{t("productDetail.total")}</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    ${formatUSDT(product.premiumAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">USDT</div>
                </div>
              </div>

              {/* 购买按钮 */}
              <Button
                className="h-12 w-full gap-2 bg-gradient-to-r from-primary to-primary/90 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110"
                size="lg"
                onClick={() => setShowPurchaseDialog(true)}
                disabled={!product.active || (tokenBalance !== undefined && tokenBalance < product.premiumAmount)}
              >
                <Shield className="h-5 w-5" />
                {!product.active 
                  ? t("productDetail.notAvailable")
                  : tokenBalance !== undefined && tokenBalance < product.premiumAmount
                  ? t("productDetail.insufficientBalance")
                  : t("products.buyNow")}
              </Button>

              {/* 安全提示 */}
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 flex-shrink-0 text-primary mt-0.5" />
                  <span>{t("productDetail.secureTransaction")}</span>
                </p>
              </div>
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
              {t("productDetail.completePurchase")} {t("common.productPrefix")}{product.id.toString()}
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

            {/* Transaction Status */}
            {(approveError || buyError) && (
              <TransactionStatus
                hash={buyHash}
                error={approveError || buyError}
                onReset={resetPurchase}
              />
            )}
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
                  onClick={purchaseStep === "buy" ? handleBuy : handlePurchase}
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
                  {purchaseStep === "buy" && t("productDetail.confirmPurchase")}
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
