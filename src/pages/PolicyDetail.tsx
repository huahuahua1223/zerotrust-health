import { useParams, useNavigate, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { usePolicy, useProduct } from "@/hooks";
import { PolicyStatus } from "@/types";

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const policyId = id ? BigInt(id) : undefined;
  const { policy, isLoading: isPolicyLoading, error: policyError } = usePolicy(policyId);
  const { product, isLoading: isProductLoading } = useProduct(policy?.productId);

  const isLoading = isPolicyLoading || isProductLoading;

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
        return <Badge variant="secondary">Unknown</Badge>;
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
    <div className="container py-8">
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
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isLoading ? (
                <Skeleton className="h-9 w-40" />
              ) : (
                <>
                  <h1 className="font-display text-3xl font-bold">{t('common.policyPrefix')}{id}</h1>
                  {policy && getStatusBadge(policy.status)}
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              <p className="text-muted-foreground">{t('common.productPrefix')}{policy?.productId?.toString()}</p>
            )}
          </div>
          {policy?.status === PolicyStatus.Active && (
            <Button asChild className="gap-2">
              <Link to={`/claim/new?policyId=${id}`}>
                <FileText className="h-4 w-4" />
                {t("policies.fileClaim")}
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("policyDetail.policyInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Description */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("policyDetail.productDescription")}</h4>
                {isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <p className="text-foreground">{t("common.notAvailable")}</p>
                )}
              </div>

              <Separator />

              {/* Coverage Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("products.premium")}</p>
                    {isLoading ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <p className="text-lg font-semibold">${product && (Number(product.premiumAmount) / 1_000_000).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("products.coverage")}</p>
                    {isLoading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <p className="text-lg font-semibold">${product && (Number(product.maxCoverage) / 1_000_000).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("policyDetail.startDate")}</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {isLoading ? (
                      <Skeleton className="h-5 w-32" />
                    ) : (
                      <span>{policy && new Date(Number(policy.startAt) * 1000).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("policyDetail.endDate")}</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {isLoading ? (
                      <Skeleton className="h-5 w-32" />
                    ) : (
                      <span>{policy && new Date(Number(policy.endAt) * 1000).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Holder Address */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("policyDetail.policyHolder")}</h4>
                {isLoading ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <code className="text-sm bg-muted px-2 py-1 rounded">{policy?.holder}</code>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Status Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <h3 className="text-2xl font-bold">
                    {daysRemaining > 0 ? daysRemaining : 0}
                  </h3>
                )}
                <p className="text-muted-foreground">{t("policyDetail.daysRemaining")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("policyDetail.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to={`/products/${policy?.productId}`}>
                  <Shield className="h-4 w-4" />
                  {t("policyDetail.viewProductDetails")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/my-claims">
                  <FileText className="h-4 w-4" />
                  {t("policyDetail.viewMyClaims")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
