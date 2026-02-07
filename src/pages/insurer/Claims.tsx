import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Shield, AlertCircle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useClaimsByPage } from "@/hooks";
import { ClaimStatus } from "@/types";
import type { Claim } from "@/types";

export default function InsurerClaims() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const { claims, isLoading, error } = useClaimsByPage();

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return <Badge className="bg-warning/10 text-warning">{t("insurerClaims.pending")}</Badge>;
      case ClaimStatus.Verified:
        return <Badge className="bg-primary/10 text-primary">{t("insurerClaims.verified")}</Badge>;
      case ClaimStatus.Approved:
        return <Badge className="bg-success/10 text-success">{t("claims.status.approved")}</Badge>;
      case ClaimStatus.Rejected:
        return <Badge className="bg-destructive/10 text-destructive">{t("claims.status.rejected")}</Badge>;
      case ClaimStatus.Paid:
        return <Badge className="bg-accent/10 text-accent">{t("claims.status.paid")}</Badge>;
    }
  };

  const formatSubmittedTime = (timestamp: bigint) => {
    if (timestamp === undefined || timestamp === null || timestamp === 0n) {
      return "—";
    }
    const date = new Date(Number(timestamp) * 1000);
    if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) {
      return "—";
    }
    return date.toLocaleString();
  };

  const pendingClaims = claims?.filter(
    (c: Claim) => c.status === ClaimStatus.Submitted || c.status === ClaimStatus.Verified
  ) ?? [];
  const approvedClaims = claims?.filter(
    (c: Claim) => c.status === ClaimStatus.Approved
  ) ?? [];
  const processedClaims = claims?.filter(
    (c: Claim) => c.status === ClaimStatus.Paid || c.status === ClaimStatus.Rejected
  ) ?? [];

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
        </div>
      </div>
    );
  }

  const ClaimCard = ({ claim }: { claim: Claim }) => (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{t("common.claimPrefix")}{claim.id.toString()}</span>
                {getStatusBadge(claim.status)}
                {claim.status >= ClaimStatus.Verified && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    ZK
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Policy #{claim.policyId.toString()} • {t("claims.submittedAt")}: {formatSubmittedTime(claim.submittedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">
                ${(Number(claim.amount) / 1_000_000).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("common.encrypted")}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to={`/insurer/claims/${claim.id.toString()}`}>
                <Eye className="mr-1 h-4 w-4" />
                {t("common.review")}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="mb-2 font-display text-3xl font-bold">{t("insurer.claims")}</h1>
        <p className="text-muted-foreground">
          {t("insurer.claimsSubtitle")}
        </p>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h3 className="mb-2 text-lg font-semibold">{t("errors.loadingFailed")}</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      )}

      {/* Tabs */}
      {!error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="gap-2">
                {t("insurerClaims.pendingReviewTab")}
                {pendingClaims.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {pendingClaims.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                {t("insurerClaims.readyToPay")}
                {approvedClaims.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {approvedClaims.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="processed">{t("insurerClaims.processed")}</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {isLoading ? (
                <LoadingSkeleton />
              ) : pendingClaims.length > 0 ? (
                pendingClaims.map((claim: Claim) => (
                  <ClaimCard key={claim.id.toString()} claim={claim} />
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  {t("insurerClaims.noPendingClaims")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {isLoading ? (
                <LoadingSkeleton />
              ) : approvedClaims.length > 0 ? (
                approvedClaims.map((claim: Claim) => (
                  <ClaimCard key={claim.id.toString()} claim={claim} />
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  {t("insurerClaims.noClaimsReady")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="processed" className="space-y-4">
              {isLoading ? (
                <LoadingSkeleton />
              ) : processedClaims.length > 0 ? (
                processedClaims.map((claim: Claim) => (
                  <ClaimCard key={claim.id.toString()} claim={claim} />
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  {t("insurerClaims.noProcessedClaims")}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
