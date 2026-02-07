import { useParams, useNavigate, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useClaim, usePolicy, useProduct } from "@/hooks";
import { ClaimStatus } from "@/types";

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const claimId = id ? BigInt(id) : undefined;
  const { claim, isLoading: isClaimLoading, error: claimError } = useClaim(claimId);
  const { policy, isLoading: isPolicyLoading } = usePolicy(claim?.policyId);
  const { isLoading: isProductLoading } = useProduct(policy?.productId);

  const isLoading = isClaimLoading || isPolicyLoading || isProductLoading;

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
          <Badge className="bg-accent/10 text-accent gap-1">
            <DollarSign className="h-3 w-3" />
            {t("claims.status.paid")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
                  <h1 className="font-display text-3xl font-bold">{t('common.claimPrefix')}{id}</h1>
                  {claim && getStatusBadge(claim.status)}
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              <p className="text-muted-foreground">{t('common.productPrefix')}{policy?.productId?.toString()}</p>
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
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t("claimDetail.claimTimeline")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  {statusTimeline.map((step, index) => (
                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            step.completed
                              ? "bg-gradient-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {index < statusTimeline.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 ${
                              step.completed ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`font-medium ${!step.completed && "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claim Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t("claimDetail.claimDetails")}
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
                        {/* 疾病类型在 ZK 证明中加密 */}
                        {t("common.encrypted")}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claims.amount")}</h4>
                      <p className="font-medium">${claim && (Number(claim.amount) / 1_000_000).toLocaleString()}</p>
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
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claimDetail.policyId")}</h4>
                      <Link to={`/my-policies/${claim?.policyId}`} className="text-primary hover:underline">
                        #{claim?.policyId.toString()}
                      </Link>
                    </div>
                  </div>

                  <Separator />

                  {/* Document Hash */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">{t("claimDetail.uploadedDocs")}</h4>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">{t("common.documentHash")}</span>
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {claim?.dataHash.slice(0, 10)}...{claim?.dataHash.slice(-8)}
                      </code>
                    </div>
                  </div>
                </>
              )}
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
          {/* ZK Proof Status */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t("claims.zkVerified")}</h3>
                {isLoading ? (
                  <Skeleton className="h-6 w-20 mx-auto" />
                ) : (
                  <Badge className={claim && claim.status >= ClaimStatus.Verified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                    {claim && claim.status >= ClaimStatus.Verified ? (
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

          {/* Proof Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("claimDetail.zkProof")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("claimDetail.proofHash")}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-full" />
                ) : claim ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                    {claim.dataHash}
                  </code>
                ) : null}
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>{t("claimDetail.proofVerifies")}</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>{t("claimDetail.verifyItems.diagnosis")}</li>
                  <li>{t("claimDetail.verifyItems.treatment")}</li>
                  <li>{t("claimDetail.verifyItems.records")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

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
        </motion.div>
      </div>
    </div>
  );
}
