import { useParams, useNavigate, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Calendar,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useClaim, usePolicy, useProduct } from "@/hooks";
import { ClaimStatus } from "@/types";
import { fetchProductMetadata } from "@/lib/ipfs";
import type { ProductMetadata } from "@/lib/ipfs";

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const claimId = id ? BigInt(id) : undefined;
  const { claim, isLoading: isClaimLoading, error: claimError } = useClaim(claimId);
  const { policy, isLoading: isPolicyLoading } = usePolicy(claim?.policyId);
  const { product, isLoading: isProductLoading } = useProduct(policy?.productId);

  // 加载产品元数据
  const [metadata, setMetadata] = useState<ProductMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  useEffect(() => {
    if (product?.uri) {
      setIsLoadingMetadata(true);
      fetchProductMetadata(product.uri)
        .then(setMetadata)
        .catch(() => {
          setMetadata({
            name: `${t("common.productPrefix")}${product.id}`,
            description: t("common.fallbackDesc"),
            diseases: [],
          });
        })
        .finally(() => setIsLoadingMetadata(false));
    }
  }, [product?.uri, product?.id, t]);

  const isLoading = isClaimLoading || isPolicyLoading || isProductLoading || isLoadingMetadata;

  const statusTimeline = [
    {
      status: ClaimStatus.Submitted,
      label: t("claimDetail.claimSubmitted"),
      completed: claim ? claim.status >= ClaimStatus.Submitted : false,
    },
    {
      status: ClaimStatus.Verified,
      label: t("claimDetail.zkProofVerified"),
      completed: claim ? claim.status >= ClaimStatus.Verified : false,
    },
    {
      status: ClaimStatus.Approved,
      label: t("claimDetail.claimApproved"),
      completed: claim ? claim.status >= ClaimStatus.Approved && claim.status !== ClaimStatus.Rejected : false,
    },
    {
      status: ClaimStatus.Paid,
      label: t("claimDetail.paymentProcessed"),
      completed: claim ? claim.status === ClaimStatus.Paid : false,
    },
  ];

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

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
          <p className="text-muted-foreground">{t("claimDetail.connectToView")}</p>
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
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
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
                <Skeleton className="h-9 w-40" />
              ) : (
                <>
                  <h1 className="font-display text-4xl font-bold">{t('common.claimPrefix')}{id}</h1>
                  {claim && getStatusBadge(claim.status)}
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              <p className="text-lg text-muted-foreground">
                {metadata?.name || `${t('common.productPrefix')}${policy?.productId?.toString()}`}
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

      {/* 横向流程时间轴 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="flex justify-between gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="timeline-horizontal">
                {statusTimeline.map((step, index) => (
                  <div key={index} className="timeline-node flex-1">
                    {/* 节点图标 */}
                    <div
                      className={`timeline-node-icon ${
                        step.completed
                          ? "timeline-node-completed"
                          : step.status === claim?.status
                          ? "timeline-node-active"
                          : "timeline-node-pending"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="h-8 w-8 text-success" />
                      ) : step.status === claim?.status ? (
                        <Clock className="h-8 w-8 animate-pulse text-primary" />
                      ) : (
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* 连接线 */}
                    {index < statusTimeline.length - 1 && (
                      <div
                        className={`timeline-connector ${
                          step.completed
                            ? "from-success to-success"
                            : "from-muted to-muted"
                        }`}
                      />
                    )}
                    
                    {/* 标签和时间 */}
                    <div className="text-center">
                      <p
                        className={`text-sm font-medium ${
                          step.completed ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.completed && claim && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {index === 0 && new Date(Number(claim.submittedAt) * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="detail-section lg:col-span-2 space-y-6"
        >
          {/* ZK 证明高亮卡片 */}
          {claim && claim.status >= ClaimStatus.Verified && (
            <div className="highlight-card">
              <div className="flex items-start gap-6">
                {/* 大图标 */}
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                
                {/* 内容 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold">{t("claims.zkVerified")}</h3>
                    <Badge className="bg-success/10 text-success animate-pulse">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("claimDetail.verified")}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("claimDetail.zkVerificationDesc")}
                  </p>
                  
                  {/* 证明哈希 */}
                  <div className="rounded-lg bg-background/80 p-4">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      {t("claimDetail.proofHash")}
                    </div>
                    <code className="block text-sm font-mono break-all">
                      {claim.dataHash}
                    </code>
                  </div>
                  
                  {/* 技术标签 */}
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Circom + Groth16
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {t("claimDetail.privacyPreserving")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 详情双栏 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 左栏 - 理赔信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("claimDetail.claimInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : (
                  <>
                    {/* 疾病类型 */}
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

                    {/* 理赔金额 */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
                        {t("claims.amount")}
                      </div>
                      <div className="text-2xl font-bold tabular-nums">
                        ${claim && (Number(claim.amount) / 1_000_000).toLocaleString()}
                      </div>
                    </div>

                    {/* 提交时间 */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {t("claims.submittedAt")}
                      </div>
                      <div className="text-sm">
                        {claim && new Date(Number(claim.submittedAt) * 1000).toLocaleString()}
                      </div>
                    </div>

                    {/* 文档哈希 */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {t("common.documentHash")}
                      </div>
                      <code className="block rounded-lg bg-muted p-2 text-xs font-mono break-all">
                        {claim?.dataHash}
                      </code>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 右栏 - 申请人与保单信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  {t("claimDetail.claimantInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : (
                  <>
                    {/* 申请人地址 */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {t("claimDetail.claimantAddress")}
                      </div>
                      <code className="block rounded-lg bg-muted p-2 text-xs font-mono break-all">
                        {claim?.claimant}
                      </code>
                    </div>

                    {/* 关联保单 */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {t("claimDetail.relatedPolicy")}
                      </div>
                      <Link
                        to={`/my-policies/${claim?.policyId}`}
                        className="inline-flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {t('common.policyPrefix')}{claim?.policyId.toString()}
                        </span>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Side Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Links */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">{t("claimDetail.quickLinks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-11">
                <Link to={`/my-policies/${claim?.policyId}`}>
                  <FileText className="h-4 w-4" />
                  {t("claimDetail.viewPolicy")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-11">
                <Link to="/my-claims">
                  <FileText className="h-4 w-4" />
                  {t("claimDetail.viewAllClaims")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("claimDetail.statusInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {claim?.status === ClaimStatus.Submitted && t("claimDetail.statusSubmittedDesc")}
                  {claim?.status === ClaimStatus.Verified && t("claimDetail.statusVerifiedDesc")}
                  {claim?.status === ClaimStatus.Approved && t("claimDetail.statusApprovedDesc")}
                  {claim?.status === ClaimStatus.Rejected && t("claimDetail.statusRejectedDesc")}
                  {claim?.status === ClaimStatus.Paid && t("claimDetail.statusPaidDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
