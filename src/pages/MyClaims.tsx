import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Shield,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { ClaimStatus } from "@/types";
import { useUserClaimsWithDetails } from "@/hooks";
import { fetchProductMetadata } from "@/lib/ipfs";
import type { ProductMetadata } from "@/lib/ipfs";

export default function MyClaims() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const { claims, isLoading, error } = useUserClaimsWithDetails();

  // 加载所有产品的元数据
  const [metadataMap, setMetadataMap] = useState<Record<string, ProductMetadata>>({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // 获取稳定的 claims 引用（避免不必要的重新加载）
  const stableClaims = useMemo(
    () => claims,
    [JSON.stringify(claims.map(c => c.id.toString()))]
  );

  useEffect(() => {
    if (stableClaims.length > 0) {
      setIsLoadingMetadata(true);
      
      // 批量加载所有产品的元数据
      Promise.all(
        stableClaims.map(async (claim) => {
          const productId = claim.policy?.productId;
          const uri = claim.product?.uri;
          
          if (!productId || !uri) return null;
          
          try {
            const metadata = await fetchProductMetadata(uri);
            return { productId: productId.toString(), metadata };
          } catch {
            return {
              productId: productId.toString(),
              metadata: {
                name: `${t("common.productPrefix")}${productId}`,
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
  }, [stableClaims, t]);

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

  const getStatusInfo = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return {
          label: t("claims.status.submitted"),
          icon: Clock,
          color: "text-warning",
          bg: "bg-warning/10",
        };
      case ClaimStatus.Verified:
        return {
          label: t("claims.status.verified"),
          icon: CheckCircle2,
          color: "text-primary",
          bg: "bg-primary/10",
        };
      case ClaimStatus.Approved:
        return {
          label: t("claims.status.approved"),
          icon: CheckCircle2,
          color: "text-success",
          bg: "bg-success/10",
        };
      case ClaimStatus.Rejected:
        return {
          label: t("claims.status.rejected"),
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
        };
      case ClaimStatus.Paid:
        return {
          label: t("claims.status.paid"),
          icon: Wallet,
          color: "text-success",
          bg: "bg-success/10",
        };
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
          <p className="text-muted-foreground">{t("claims.connectToView")}</p>
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
          <h1 className="mb-2 font-display text-3xl font-bold">{t("claims.title")}</h1>
          <p className="text-muted-foreground">{t("claims.subtitle")}</p>
        </div>
        <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/claim/new">
            <Plus className="h-4 w-4" />
            {t("nav.submitClaim")}
          </Link>
        </Button>
      </motion.div>

      {/* Loading State */}
      {(isLoading || isLoadingMetadata) && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
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

      {/* Claims Kanban */}
      {!isLoading && !isLoadingMetadata && !error && claims.length > 0 && (
        <div className="kanban-columns border-2 border-border rounded-2xl p-6 bg-card/50 shadow-sm">
          {[
            {
              status: ClaimStatus.Submitted,
              title: t("claims.status.submitted"),
              icon: Clock,
              color: "text-warning",
              bg: "bg-warning/10",
            },
            {
              status: ClaimStatus.Verified,
              title: t("claims.status.verified"),
              icon: CheckCircle2,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              status: [ClaimStatus.Approved, ClaimStatus.Rejected],
              title: t("claims.approvedRejected"),
              icon: CheckCircle2,
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              status: ClaimStatus.Paid,
              title: t("claims.status.paid"),
              icon: Wallet,
              color: "text-success",
              bg: "bg-success/10",
            },
          ].map((column, columnIndex) => {
            const StatusIcon = column.icon;
            const columnClaims = claims.filter((claim) => 
              Array.isArray(column.status)
                ? column.status.includes(claim.status)
                : claim.status === column.status
            );

            return (
              <div key={columnIndex} className="kanban-column bg-card/50 border-2 border-border rounded-lg p-4 shadow-sm">
                <div className="kanban-header">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${column.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${column.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{column.title}</h3>
                      <p className="text-xs text-muted-foreground">{columnClaims.length} {t("claims.claimsCount")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {columnClaims.length === 0 ? (
                    <div className="kanban-empty">
                      <StatusIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">{t("claims.noClaimsYet")}</p>
                    </div>
                  ) : (
                    columnClaims.map((claim) => {
                      const statusInfo = getStatusInfo(claim.status);
                      const CardIcon = statusInfo.icon;
                      const productId = claim.policy?.productId?.toString();

                      return (
                        <motion.div
                          key={claim.id.toString()}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link to={`/claims/${claim.id.toString()}`}>
                            <Card className="kanban-card-drag overflow-hidden bg-card border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${statusInfo.bg}`}>
                                    <CardIcon className={`h-5 w-5 ${statusInfo.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="text-sm font-semibold">
                                        {t("common.claimPrefix")}{claim.id.toString()}
                                      </span>
                                      {claim.status >= ClaimStatus.Verified && (
                                        <Badge variant="outline" className="gap-1 text-xs">
                                          <Shield className="h-2.5 w-2.5" />
                                          ZK
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {productId && metadataMap[productId]?.name || `${t("common.productPrefix")}${productId || "—"}`}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                      <span className="font-semibold text-primary tabular-nums">
                                        ${formatUSDT(claim.amount)}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {formatDate(claim.submittedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && claims.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t("claims.noClaims")}</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("claims.noClaimsSubtitle")}
          </p>
          <Button asChild>
            <Link to="/claim/new">{t("nav.submitClaim")}</Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
