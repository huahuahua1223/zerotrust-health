import { useParams, useNavigate, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Shield,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { usePolicy, useProduct } from "@/hooks";
import { PolicyStatus } from "@/types";
import { fetchProductMetadata } from "@/lib/ipfs";
import type { ProductMetadata } from "@/lib/ipfs";

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const policyId = id ? BigInt(id) : undefined;
  const { policy, isLoading: isPolicyLoading, error: policyError } = usePolicy(policyId);
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

  const isLoading = isPolicyLoading || isProductLoading || isLoadingMetadata;

  const getStatusBadge = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.Active:
        return (
          <Badge className="bg-success/10 text-success gap-1">
            <CheckCircle className="h-3 w-3" />
            {t("policies.status.active")}
          </Badge>
        );
      case PolicyStatus.Expired:
        return (
          <Badge className="bg-muted text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            {t("policies.status.expired")}
          </Badge>
        );
      case PolicyStatus.Cancelled:
        return (
          <Badge className="bg-destructive/10 text-destructive gap-1">
            <XCircle className="h-3 w-3" />
            {t("policies.status.cancelled")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{t("common.unknown")}</Badge>;
    }
  };

  const daysRemaining = policy 
    ? Math.ceil((Number(policy.endAt) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
          <p className="text-muted-foreground">{t("policyDetail.connectToView")}</p>
        </div>
      </div>
    );
  }

  if (policyError) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.loadingFailed")}</h2>
          <p className="text-muted-foreground">{policyError.message}</p>
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
                  <h1 className="font-display text-4xl font-bold">{t('common.policyPrefix')}{id}</h1>
                  {policy && getStatusBadge(policy.status)}
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
          {policy?.status === PolicyStatus.Active && (
            <Button asChild className="gap-2 h-12 px-6" size="lg">
              <Link to={`/claim/new?policyId=${id}`}>
                <FileText className="h-5 w-5" />
                {t("policies.fileClaim")}
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* 剩余天数大卡片 - 全宽 Hero Card */}
      {policy?.status === PolicyStatus.Active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
                {/* 圆环进度图 */}
                <div className="relative flex-shrink-0">
                  <svg className="progress-ring" width="180" height="180">
                    {/* 背景圆 */}
                    <circle
                      cx="90"
                      cy="90"
                      r="75"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      className="text-muted/20"
                    />
                    {/* 进度圆 */}
                    <circle
                      cx="90"
                      cy="90"
                      r="75"
                      stroke="url(#policyGradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      className="progress-ring-circle"
                      strokeDasharray={`${2 * Math.PI * 75}`}
                      strokeDashoffset={`${2 * Math.PI * 75 * (1 - (policy ? Math.max(0, daysRemaining) / (product?.coveragePeriodDays || 365) : 0))}`}
                    />
                    <defs>
                      <linearGradient id="policyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--success))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* 中心文字 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-primary tabular-nums">
                      {Math.max(0, daysRemaining)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("policyDetail.daysRemaining")}
                    </div>
                  </div>
                </div>

                {/* 时间轴可视化 */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="mb-4 text-xl font-semibold">{t("policyDetail.policyPeriod")}</h3>
                    <div className="relative">
                      {/* 时间轴线 */}
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                          style={{
                            width: `${policy ? Math.min(100, ((Date.now() / 1000 - Number(policy.startAt)) / (Number(policy.endAt) - Number(policy.startAt))) * 100) : 0}%`
                          }}
                        />
                      </div>
                      {/* 日期标记 */}
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">{t("policyDetail.startDate")}</div>
                          <div className="font-semibold">
                            {policy && new Date(Number(policy.startAt) * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{t("policyDetail.endDate")}</div>
                          <div className="font-semibold">
                            {policy && new Date(Number(policy.endAt) * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 状态描述 */}
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      {daysRemaining > 0 
                        ? t("policyDetail.activePolicyDesc", { days: daysRemaining })
                        : t("policyDetail.expiredPolicyDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="detail-section lg:col-span-2 space-y-6"
        >
          {/* 信息卡片网格 2x2 */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 保费 */}
            <div className="stat-card">
              <div className="stat-card-icon bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-3">
                <div className="stat-card-label">{t("products.premium")}</div>
                {isLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <div className="stat-card-value text-primary">
                    ${product && (Number(product.premiumAmount) / 1_000_000).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* 保额 */}
            <div className="stat-card">
              <div className="stat-card-icon bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div className="mt-3">
                <div className="stat-card-label">{t("products.coverage")}</div>
                {isLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <div className="stat-card-value">
                    ${product && (Number(product.maxCoverage) / 1_000_000).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* 保障期 */}
            <div className="stat-card">
              <div className="stat-card-icon bg-muted">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="mt-3">
                <div className="stat-card-label">{t("products.duration")}</div>
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <>
                    <div className="stat-card-value">
                      {product?.coveragePeriodDays || 365}
                    </div>
                    <div className="text-sm text-muted-foreground">{t("products.days")}</div>
                  </>
                )}
              </div>
            </div>

            {/* 保单持有人 */}
            <div className="stat-card">
              <div className="stat-card-icon bg-muted">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="mt-3">
                <div className="stat-card-label">{t("policyDetail.policyHolder")}</div>
                {isLoading ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  <code className="block text-sm font-mono truncate">
                    {policy?.holder.slice(0, 10)}...{policy?.holder.slice(-8)}
                  </code>
                )}
              </div>
            </div>
          </div>

          {/* 产品描述卡片 */}
          {metadata?.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("policyDetail.productDescription")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {metadata.description}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Side Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">{t("policyDetail.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {policy?.status === PolicyStatus.Active && (
                <Button asChild className="w-full h-12 gap-2 bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                  <Link to={`/claim/new?policyId=${id}`}>
                    <FileText className="h-5 w-5" />
                    {t("policies.fileClaim")}
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-11">
                <Link to={`/products/${policy?.productId}`}>
                  <Shield className="h-4 w-4" />
                  {t("policyDetail.viewProductDetails")}
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-11">
                <Link to="/my-claims">
                  <FileText className="h-4 w-4" />
                  {t("policyDetail.viewMyClaims")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 保单持有人信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("policyDetail.policyHolder")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <code className="block rounded-lg bg-muted p-3 text-xs font-mono break-all">
                  {policy?.holder}
                </code>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
