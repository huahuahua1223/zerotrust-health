import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Shield, Clock, AlertCircle, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PolicyStatus } from "@/types";
import { useUserPoliciesWithDetails } from "@/hooks";
import { fetchProductMetadata } from "@/lib/ipfs";
import type { ProductMetadata } from "@/lib/ipfs";
import type { PolicyWithProduct } from "@/types";

export default function MyPolicies() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  
  const { policies, isLoading, error } = useUserPoliciesWithDetails();

  // 加载所有产品的元数据
  const [metadataMap, setMetadataMap] = useState<Record<string, ProductMetadata>>({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // 获取稳定的 policies 引用（避免不必要的重新加载）
  const stablePolicies = useMemo(
    () => policies,
    [JSON.stringify(policies.map(p => p.id.toString()))]
  );

  useEffect(() => {
    if (stablePolicies.length > 0) {
      setIsLoadingMetadata(true);
      
      // 批量加载所有产品的元数据
      Promise.all(
        stablePolicies.map(async (policy) => {
          if (!policy.product?.uri) return null;
          
          try {
            const metadata = await fetchProductMetadata(policy.product.uri);
            return { productId: policy.productId.toString(), metadata };
          } catch {
            return {
              productId: policy.productId.toString(),
              metadata: {
                name: `${t("common.productPrefix")}${policy.productId}`,
                description: t("common.fallbackDesc"),
                diseases: [],
              },
            };
          }
        })
      ).then((results) => {
        const map: Record<string, ProductMetadata> = {};
        results.forEach((result) => {
          if (result) {
            map[result.productId] = result.metadata;
          }
        });
        setMetadataMap(map);
        setIsLoadingMetadata(false);
      });
    }
  }, [stablePolicies, t]);

  const formatUSDT = (value: bigint) => {
    // 使用 6 位精度（当前 MockERC20 合约的实际精度）
    const formatted = formatUnits(value, 6);
    const num = Number(formatted);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const getDaysRemaining = (endTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(endTime) - now;
    return Math.max(0, Math.floor(remaining / (24 * 60 * 60)));
  };

  const getStatusBadge = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.Active:
        return <Badge className="bg-success/10 text-success">{t("policies.status.active")}</Badge>;
      case PolicyStatus.Expired:
        return <Badge variant="secondary">{t("policies.status.expired")}</Badge>;
      case PolicyStatus.Cancelled:
        return <Badge variant="destructive">{t("policies.status.cancelled")}</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
          <p className="text-muted-foreground">{t("policies.connectToView")}</p>
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
          <h1 className="mb-2 font-display text-3xl font-bold">{t("policies.title")}</h1>
          <p className="text-muted-foreground">{t("policies.subtitle")}</p>
        </div>
        <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/products">
            <Plus className="h-4 w-4" />
            {t("policies.buyFirst")}
          </Link>
        </Button>
      </motion.div>

      {/* Loading State */}
      {(isLoading || isLoadingMetadata) && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-1 bg-muted" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.loadingFailed")}</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      )}

      {/* Policies Timeline */}
      {!isLoading && !isLoadingMetadata && !error && policies.length > 0 && (
        <div className="timeline-container">
          <div className="timeline-line" />
          
          {policies.map((policy, index) => {
            const daysRemaining = getDaysRemaining(policy.endAt);
            const isExpired = policy.status !== PolicyStatus.Active;
            const totalDays = policy.product 
              ? Number(policy.product.coveragePeriodDays)
              : 365;
            const progressPercent = isExpired 
              ? 0 
              : Math.round((daysRemaining / totalDays) * 100);

            return (
              <motion.div
                key={policy.id.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="timeline-item"
              >
                {/* Timeline dot */}
                <div className={cn(
                  "timeline-dot",
                  policy.status === PolicyStatus.Active 
                    ? "timeline-dot-active animate-pulse-ring" 
                    : "timeline-dot-expired"
                )}>
                  <Shield className={cn(
                    "h-4 w-4",
                    policy.status === PolicyStatus.Active 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )} />
                </div>

                {/* Card */}
                <Card className={cn(
                  "card-hover transition-all duration-200",
                  policy.status === PolicyStatus.Active 
                    ? "timeline-card-active border-primary/30 shadow-md" 
                    : "opacity-60 hover:opacity-80"
                )}>
                  <div
                    className={`h-1 ${
                      policy.status === PolicyStatus.Active
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">
                              {metadataMap[policy.productId.toString()]?.name || `${t("common.productPrefix")}${policy.productId.toString()}`}
                            </h3>
                            {getStatusBadge(policy.status)}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Policy #{policy.id.toString()} • {t("products.coverage")}: $
                            {policy.product ? formatUSDT(policy.product.maxCoverage) : "—"}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(policy.startAt)} - {formatDate(policy.endAt)}
                            </span>
                            {policy.status === PolicyStatus.Active && (
                              <span className="text-success font-medium">
                                {daysRemaining} {t("policies.daysRemaining")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Circular progress for active policies */}
                      {policy.status === PolicyStatus.Active && (
                        <div className="flex items-center gap-4">
                          <div className="relative flex h-20 w-20 items-center justify-center">
                            <svg className="progress-ring h-full w-full">
                              <circle
                                className="text-muted"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="transparent"
                                r="34"
                                cx="40"
                                cy="40"
                              />
                              <circle
                                className="progress-ring-circle text-primary"
                                strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="34"
                                cx="40"
                                cy="40"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-lg font-bold tabular-nums">{progressPercent}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 lg:flex-col">
                        <Button asChild variant="outline" size="sm" className="flex-1 lg:flex-none lg:w-full">
                          <Link to={`/my-policies/${policy.id.toString()}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t("common.viewDetails")}
                          </Link>
                        </Button>
                        {policy.status === PolicyStatus.Active && (
                          <Button asChild size="sm" className="flex-1 lg:flex-none lg:w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link to={`/claim/new?policyId=${policy.id.toString()}`}>
                              {t("policies.fileClaim")}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isLoadingMetadata && !error && policies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t("policies.noPolicies")}</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("policies.noPoliciesSubtitle")}
          </p>
          <Button asChild>
            <Link to="/products">{t("policies.buyFirst")}</Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
