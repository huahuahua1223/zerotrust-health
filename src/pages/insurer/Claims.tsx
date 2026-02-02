import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Wallet,
  Shield,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useInsurerClaimsWithDetails, useApproveClaim, useRejectClaim, usePayClaim } from "@/hooks";
import { ClaimStatus, DiseaseTypes } from "@/types";
import type { Claim } from "@/types";

export default function InsurerClaims() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const { claims, isLoading, error } = useInsurerClaimsWithDetails();
  
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { approveClaim, isPending: isApproving } = useApproveClaim();
  const { rejectClaim, isPending: isRejecting } = useRejectClaim();
  const { payClaim, isPending: isPaying } = usePayClaim();

  const handleAction = async (action: "approve" | "reject" | "pay") => {
    if (!selectedClaim) return;
    
    try {
      if (action === "approve") {
        await approveClaim(selectedClaim.id);
      } else if (action === "reject") {
        await rejectClaim(selectedClaim.id);
      } else if (action === "pay") {
        await payClaim(selectedClaim.id);
      }
      
      toast({
        title: action === "approve" 
          ? t("claims.status.approved") 
          : action === "reject" 
          ? t("claims.status.rejected") 
          : t("claims.status.paid"),
        description: `Claim #${selectedClaim.id.toString()}`,
      });
      setShowDetailDialog(false);
    } catch (err) {
      toast({
        title: t("errors.transactionFailed"),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

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

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const pendingClaims = claims?.filter(
    (c) => c.status === ClaimStatus.Submitted || c.status === ClaimStatus.Verified
  ) || [];
  const approvedClaims = claims?.filter(
    (c) => c.status === ClaimStatus.Approved
  ) || [];
  const processedClaims = claims?.filter(
    (c) => c.status === ClaimStatus.Paid || c.status === ClaimStatus.Rejected
  ) || [];

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
                <span className="font-medium">Claim #{claim.id.toString()}</span>
                {getStatusBadge(claim.status)}
                {claim.proofVerified && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    ZK
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Policy #{claim.policyId.toString()} • {formatDate(claim.submittedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">
                ${(Number(claim.amount) / 1_000_000).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {DiseaseTypes[Number(claim.diseaseType) as keyof typeof DiseaseTypes] || "Other"}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedClaim(claim);
                setShowDetailDialog(true);
              }}
            >
              <Eye className="mr-1 h-4 w-4" />
              {t("common.review")}
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
                pendingClaims.map((claim) => (
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
                approvedClaims.map((claim) => (
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
                processedClaims.map((claim) => (
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

      {/* Claim Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Claim #{selectedClaim?.id.toString()}</DialogTitle>
            <DialogDescription>
              {t("insurerClaims.reviewDetails")}
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("insurerClaims.policyId")}</span>
                  <span className="font-medium">#{selectedClaim.policyId.toString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("insurerClaims.claimant")}</span>
                  <span className="font-mono text-xs">
                    {selectedClaim.claimant.slice(0, 10)}...{selectedClaim.claimant.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("insurerClaims.diseaseType")}</span>
                  <span className="font-medium">
                    {DiseaseTypes[Number(selectedClaim.diseaseType) as keyof typeof DiseaseTypes] || "Other"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("insurerClaims.amount")}</span>
                  <span className="font-semibold text-primary">
                    ${(Number(selectedClaim.amount) / 1_000_000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("claimDetail.zkProof")}</span>
                  <span className="flex items-center gap-1 text-success">
                    {selectedClaim.proofVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {t("insurerClaims.verified")}
                      </>
                    ) : (
                      <span className="text-warning">{t("insurerClaims.pending")}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("insurerClaims.status")}</span>
                  {getStatusBadge(selectedClaim.status)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedClaim?.status === ClaimStatus.Submitted ||
            selectedClaim?.status === ClaimStatus.Verified ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("reject")}
                  disabled={isApproving || isRejecting || isPaying}
                >
                  {isRejecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("insurer.reject")}
                </Button>
                <Button
                  onClick={() => handleAction("approve")}
                  disabled={isApproving || isRejecting || isPaying}
                  className="bg-success hover:bg-success/90"
                >
                  {isApproving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {t("insurer.approve")}
                </Button>
              </>
            ) : selectedClaim?.status === ClaimStatus.Approved ? (
              <Button
                onClick={() => handleAction("pay")}
                disabled={isApproving || isRejecting || isPaying}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                {isPaying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                {t("insurer.pay")}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                {t("common.close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
