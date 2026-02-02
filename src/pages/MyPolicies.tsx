import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { Shield, Clock, AlertCircle, FileText, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { PolicyStatus } from "@/types";
import { useUserPoliciesWithDetails } from "@/hooks";

export default function MyPolicies() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  
  const { policies, isLoading, error } = useUserPoliciesWithDetails();

  const formatUSDT = (value: bigint) => {
    return parseFloat(formatUnits(value, 6)).toLocaleString();
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
        <Button asChild className="gap-2 bg-gradient-primary hover:opacity-90">
          <Link to="/products">
            <Plus className="h-4 w-4" />
            {t("policies.buyFirst")}
          </Link>
        </Button>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
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

      {/* Policies List */}
      {!isLoading && !error && policies.length > 0 && (
        <div className="space-y-4">
          {policies.map((policy, index) => (
            <motion.div
              key={policy.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-hover overflow-hidden">
                <div
                  className={`h-1 ${
                    policy.status === PolicyStatus.Active
                      ? "bg-gradient-primary"
                      : "bg-muted"
                  }`}
                />
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {policy.product?.name || `Product #${policy.productId.toString()}`}
                          </h3>
                          {getStatusBadge(policy.status)}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Policy #{policy.id.toString()} • {t("products.coverage")}: $
                          {policy.product ? formatUSDT(policy.product.coverageAmount) : "—"}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(policy.startTime)} - {formatDate(policy.endTime)}
                          </span>
                          {policy.status === PolicyStatus.Active && (
                            <span className="text-success">
                              {getDaysRemaining(policy.endTime)} {t("policies.daysRemaining")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:flex-col sm:items-end">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/my-policies/${policy.id.toString()}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          {t("common.viewDetails")}
                        </Link>
                      </Button>
                      {policy.status === PolicyStatus.Active && (
                        <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90">
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
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && policies.length === 0 && (
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
