import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
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
  const { claim, isLoading: isClaimLoading, error: claimError } = useClaim(claimId);
  const { policy, isLoading: isPolicyLoading } = usePolicy(claim?.policyId);
  const { product, isLoading: isProductLoading } = useProduct(policy?.productId);

  const { approveClaim, isPending: isApproving, isConfirming: isApproveConfirming } = useApproveClaim();
  const { rejectClaim, isPending: isRejecting, isConfirming: isRejectConfirming } = useRejectClaim();
  const { payoutClaim, isPending: isPaying, isConfirming: isPayConfirming } = usePayoutClaim();

  const isLoading = isClaimLoading || isPolicyLoading || isProductLoading;
  const isProcessing = isApproving || isRejecting || isPaying || isApproveConfirming || isRejectConfirming || isPayConfirming;

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
          <Badge className="bg-accent/10 text-accent gap-1">
            <DollarSign className="h-3 w-3" />
            {t("claims.status.paid")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
    <div className="container py-8">
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
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isLoading ? (
                <Skeleton className="h-9 w-48" />
              ) : (
                <>
                  <h1 className="font-display text-3xl font-bold">{t("insurerClaimDetail.reviewClaim")} #{id}</h1>
                  {claim && getStatusBadge(claim.status)}
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              <p className="text-muted-foreground">{`Product #${policy?.productId?.toString()}`}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t("claims.amount")}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">${claim && (Number(claim.amount) / 1_000_000).toLocaleString()}</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* ZK Verification Status */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t("insurerClaimDetail.zkProofVerified")}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("insurerClaimDetail.zkProofDesc")}
                  </p>
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <Badge className={claim?.status === ClaimStatus.Verified || claim?.status === ClaimStatus.Approved || claim?.status === ClaimStatus.Paid ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                    {claim?.status === ClaimStatus.Verified || claim?.status === ClaimStatus.Approved || claim?.status === ClaimStatus.Paid ? (
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
            </CardContent>
          </Card>

          {/* Claim Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t("insurerClaimDetail.claimInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claimDetail.diseaseType")}</h4>
                      <p className="font-medium">
                        {/* 疾病类型信息在 ZK 证明中加密，无法直接显示 */}
                        {t("common.encrypted")}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claims.amount")}</h4>
                      <p className="font-medium text-lg">${claim && (Number(claim.amount) / 1_000_000).toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claims.submittedAt")}</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{claim && new Date(Number(claim.submittedAt) * 1000).toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claimDetail.dataHash")}</h4>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {claim?.dataHash.slice(0, 10)}...{claim?.dataHash.slice(-8)}
                      </code>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Policy Details */}
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
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("insurerClaimDetail.policyId")}</p>
                    <p className="font-medium">#{claim?.policyId.toString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("products.coverage")}</p>
                    <p className="font-medium">${product && (Number(product.maxCoverage) / 1_000_000).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("insurerClaimDetail.validUntil")}</p>
                    <p className="font-medium">{policy && new Date(Number(policy.endAt) * 1000).toLocaleDateString()}</p>
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
          transition={{ delay: 0.2 }}
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
                <Skeleton className="h-6 w-full" />
              ) : (
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  {claim?.claimant}
                </code>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("insurerClaimDetail.actions")}</CardTitle>
              <CardDescription>{t("insurerClaimDetail.actionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : claim?.status === ClaimStatus.Verified || claim?.status === ClaimStatus.Submitted ? (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full gap-2" disabled={isProcessing}>
                        {isApproving || isApproveConfirming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4" />
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
                      <Button variant="destructive" className="w-full gap-2" disabled={isProcessing}>
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
                  className="w-full gap-2 bg-success hover:bg-success/90"
                  disabled={isProcessing}
                  onClick={() => handleAction("pay")}
                >
                  {isPaying || isPayConfirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Banknote className="h-4 w-4" />
                  )}
                  {t("insurer.pay")}
                </Button>
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  {t("insurerClaimDetail.claimProcessed")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
