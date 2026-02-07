import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  AlertCircle,
  Zap,
  Calendar,
  User,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Banknote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useClaim, usePolicy, useProduct, useApproveClaim, useRejectClaim, usePayoutClaim } from "@/hooks";
import { ClaimStatus } from "@/types";

export default function InsurerClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [rejectReason, setRejectReason] = useState("");

  const claimId = id ? BigInt(id) : undefined;
  const { claim, isLoading: isClaimLoading, error: claimError, refetch: refetchClaim } = useClaim(claimId);
  const { policy, isLoading: isPolicyLoading } = usePolicy(claim?.policyId);
  const { product, isLoading: isProductLoading } = useProduct(policy?.productId);

  const { approveClaim, isPending: isApproving, isConfirming: isApproveConfirming, isSuccess: isApproveSuccess } = useApproveClaim();
  const { rejectClaim, isPending: isRejecting, isConfirming: isRejectConfirming, isSuccess: isRejectSuccess } = useRejectClaim();
  const { payoutClaim, isPending: isPaying, isConfirming: isPayConfirming, isSuccess: isPaySuccess } = usePayoutClaim();

  const isLoading = isClaimLoading || isPolicyLoading || isProductLoading;
  const isProcessing = isApproving || isRejecting || isPaying || isApproveConfirming || isRejectConfirming || isPayConfirming;

  // 监听交易成功，自动刷新理赔数据
  useEffect(() => {
    if (isApproveSuccess || isRejectSuccess || isPaySuccess) {
      // 等待一小段时间让区块链状态更新
      const timer = setTimeout(() => {
        refetchClaim();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isApproveSuccess, isRejectSuccess, isPaySuccess, refetchClaim]);

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return (
          <Badge className="bg-warning/10 text-warning gap-1">
            <Clock className="h-3 w-3" />
            {t("claims.status.submitted")}
          </Badge>
        );
      case ClaimStatus.Verified:
        return (
          <Badge className="bg-primary/10 text-primary gap-1">
            <Zap className="h-3 w-3" />
            {t("claims.status.verified")}
          </Badge>
        );
      case ClaimStatus.Approved:
        return (
          <Badge className="bg-success/10 text-success gap-1">
            <CheckCircle className="h-3 w-3" />
            {t("claims.status.approved")}
          </Badge>
        );
      case ClaimStatus.Rejected:
        return (
          <Badge className="bg-destructive/10 text-destructive gap-1">
            <XCircle className="h-3 w-3" />
            {t("claims.status.rejected")}
          </Badge>
        );
      case ClaimStatus.Paid:
        return (
          <Badge className="bg-primary/10 text-primary gap-1">
            <DollarSign className="h-3 w-3" />
            {t("claims.status.paid")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{t("common.unknown")}</Badge>;
    }
  };

  const handleAction = async (actionType: "approve" | "reject" | "pay") => {
    if (!claim) return;
    
    try {
      if (actionType === "approve") {
        await approveClaim(claim.id);
      } else if (actionType === "reject") {
        // rejectClaim 需要两个参数：claimId 和 decisionMemoHash
        const memoHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
        await rejectClaim(claim.id, memoHash);
      } else if (actionType === "pay") {
        await payoutClaim(claim.id);
      }

      const messages = {
        approve: t("insurerClaimDetail.claimApproved"),
        reject: t("insurerClaimDetail.claimRejected"),
        pay: t("insurerClaimDetail.paymentProcessed"),
      };

      toast({
        title: t("common.success"),
        description: messages[actionType],
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
          <p className="text-muted-foreground">{t("insurerClaimDetail.connectToReview")}</p>
        </div>
      </div>
    );
  }

  if (claimError) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.loadingFailed")}</h2>
          <p className="text-muted-foreground">{claimError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/insurer/claims">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="detail-hero mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isLoading ? (
                <Skeleton className="h-9 w-48" />
              ) : (
                <>
                  <h1 className="font-display text-4xl font-bold">
                    {t("insurerClaimDetail.reviewClaim")} #{id}
                  </h1>
                  {claim && getStatusBadge(claim.status)}
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              <p className="text-lg text-muted-foreground">
                {`${t("common.productPrefix")}${policy?.productId?.toString()}`}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">{t("claims.amount")}</p>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <p className="text-4xl font-bold text-primary tabular-nums">
                  ${claim && (Number(claim.amount) / 1_000_000).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">USDT</p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* 审核仪表盘头部 - ZK 验证状态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="highlight-card">
          <div className="flex items-start gap-6">
            {/* 大图标 */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-10 w-10 text-primary" />
            </div>
            
            {/* 内容 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{t("insurerClaimDetail.zkProofVerified")}</h3>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <Badge
                    className={
                      claim?.status === ClaimStatus.Verified ||
                      claim?.status === ClaimStatus.Approved ||
                      claim?.status === ClaimStatus.Paid
                        ? "bg-success/10 text-success animate-pulse"
                        : "bg-warning/10 text-warning"
                    }
                  >
                    {claim?.status === ClaimStatus.Verified ||
                    claim?.status === ClaimStatus.Approved ||
                    claim?.status === ClaimStatus.Paid ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("claims.status.verified")}
                      </>
                    ) : (
                      t("insurerClaims.pending")
                    )}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("insurerClaimDetail.zkProofDesc")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 关键指标行 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {/* 理赔金额 */}
          <div className="stat-card">
            <div className="stat-card-icon bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3">
              <div className="stat-card-label">{t("claims.amount")}</div>
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <div className="stat-card-value text-primary">
                  ${claim && (Number(claim.amount) / 1_000_000).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* 提交时间 */}
          <div className="stat-card">
            <div className="stat-card-icon bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <div className="stat-card-label">{t("claims.submittedAt")}</div>
              {isLoading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                <div className="text-sm font-semibold">
                  {claim && new Date(Number(claim.submittedAt) * 1000).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* 状态 */}
          <div className="stat-card">
            <div className="stat-card-icon bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <div className="stat-card-label">{t("common.status")}</div>
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <div className="mt-1">{claim && getStatusBadge(claim.status)}</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="detail-section lg:col-span-2 space-y-6"
        >
          {/* 理赔信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t("insurerClaimDetail.claimInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {t("claimDetail.diseaseType")}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-muted p-1.5">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{t("common.encrypted")}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {t("claims.submittedAt")}
                  </div>
                  <div className="text-sm">
                    {isLoading ? (
                      <Skeleton className="h-5 w-full" />
                    ) : (
                      claim && new Date(Number(claim.submittedAt) * 1000).toLocaleString()
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {t("claimDetail.dataHash")}
                  </div>
                  <code className="block rounded-lg bg-muted p-2 text-xs font-mono break-all">
                    {isLoading ? (
                      <Skeleton className="h-4 w-full" />
                    ) : (
                      claim?.dataHash
                    )}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 关联保单卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("insurerClaimDetail.associatedPolicy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t("insurerClaimDetail.policyId")}</p>
                    <p className="text-xl font-bold">#{claim?.policyId.toString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t("products.coverage")}</p>
                    <p className="text-xl font-bold tabular-nums">
                      ${product && (Number(product.maxCoverage) / 1_000_000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t("insurerClaimDetail.validUntil")}</p>
                    <p className="font-semibold">
                      {policy && new Date(Number(policy.endAt) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Claimant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("claimDetail.claimant")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <code className="block rounded-lg bg-muted p-3 text-xs font-mono break-all">
                  {claim?.claimant}
                </code>
              )}
            </CardContent>
          </Card>

          {/* Actions Panel - Sticky */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">{t("insurerClaimDetail.actions")}</CardTitle>
              <CardDescription>{t("insurerClaimDetail.actionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : claim?.status === ClaimStatus.Verified || claim?.status === ClaimStatus.Submitted ? (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="h-12 w-full gap-2"
                        style={{ 
                          backgroundColor: 'hsl(var(--success))',
                          color: 'hsl(var(--success-foreground))'
                        }}
                        size="lg"
                        disabled={isProcessing}
                        onMouseEnter={(e) => {
                          if (!isProcessing) {
                            e.currentTarget.style.backgroundColor = 'hsl(var(--success) / 0.9)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'hsl(var(--success))';
                        }}
                      >
                        {isApproving || isApproveConfirming ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-5 w-5" />
                        )}
                        {t("insurer.approve")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("insurerClaimDetail.approveClaim")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("insurerClaimDetail.approveConfirm")} ${claim && (Number(claim.amount) / 1_000_000).toLocaleString()}?
                          {t("insurerClaimDetail.cannotUndo")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleAction("approve")}>
                          {t("common.confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 w-full gap-2 border-destructive text-destructive hover:bg-destructive/10"
                        disabled={isProcessing}
                      >
                        {isRejecting || isRejectConfirming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsDown className="h-4 w-4" />
                        )}
                        {t("insurer.reject")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("insurerClaimDetail.rejectClaim")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("insurerClaimDetail.rejectDesc")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="reason">{t("insurerClaimDetail.rejectionReason")}</Label>
                        <Textarea
                          id="reason"
                          placeholder={t("insurerClaimDetail.rejectionPlaceholder")}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAction("reject")}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {t("insurer.reject")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : claim?.status === ClaimStatus.Approved ? (
                <Button
                  className="h-12 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  disabled={isProcessing}
                  onClick={() => handleAction("pay")}
                >
                  {isPaying || isPayConfirming ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Banknote className="h-5 w-5" />
                  )}
                  {t("insurer.pay")}
                </Button>
              ) : (
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("insurerClaimDetail.claimProcessed")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
