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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { ClaimStatus } from "@/types";

// Mock data
const mockClaim = {
  id: 1n,
  policyId: 1n,
  productName: "Comprehensive Health Plan",
  claimant: "0x1234567890abcdef1234567890abcdef12345678",
  amount: 2500,
  diseaseType: "General Surgery",
  status: ClaimStatus.Verified,
  zkVerified: true,
  submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  documents: [
    { name: "medical_report.pdf", hash: "0xabc123..." },
    { name: "hospital_receipt.pdf", hash: "0xdef456..." },
  ],
  proofHash: "0x789abc...def123",
};

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const claim = mockClaim;

  const statusTimeline = [
    {
      status: ClaimStatus.Submitted,
      label: t("claimDetail.claimSubmitted"),
      date: claim.submittedAt,
      completed: true,
    },
    {
      status: ClaimStatus.Verified,
      label: t("claimDetail.zkProofVerified"),
      date: claim.verifiedAt,
      completed: true,
    },
    {
      status: ClaimStatus.Approved,
      label: t("claimDetail.claimApproved"),
      date: null,
      completed: false,
    },
    {
      status: ClaimStatus.Paid,
      label: t("claimDetail.paymentProcessed"),
      date: null,
      completed: false,
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

  return (
    <div className="container py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/my-claims">
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
              <h1 className="font-display text-3xl font-bold">Claim #{id}</h1>
              {getStatusBadge(claim.status)}
            </div>
            <p className="text-muted-foreground">{claim.productName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t("claims.amount")}</p>
            <p className="text-2xl font-bold">${claim.amount.toLocaleString()}</p>
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
              <div className="relative">
                {statusTimeline.map((step, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    {/* Line */}
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
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <p className={`font-medium ${!step.completed && "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-muted-foreground">
                          {step.date.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claimDetail.diseaseType")}</h4>
                  <p className="font-medium">{claim.diseaseType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claims.amount")}</h4>
                  <p className="font-medium">${claim.amount.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claims.submittedAt")}</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{claim.submittedAt.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("claimDetail.policyId")}</h4>
                  <Link to={`/my-policies/${claim.policyId}`} className="text-primary hover:underline">
                    #{claim.policyId.toString()}
                  </Link>
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{t("claimDetail.uploadedDocs")}</h4>
                <div className="space-y-2">
                  {claim.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <code className="text-xs text-muted-foreground">{doc.hash}</code>
                    </div>
                  ))}
                </div>
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
          {/* ZK Proof Status */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t("claims.zkVerified")}</h3>
                <Badge className="bg-success/10 text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t("claims.status.verified")}
                </Badge>
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
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  {claim.proofHash}
                </code>
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
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {claim.claimant}
              </code>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
