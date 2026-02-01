import { useState } from "react";
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
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Banknote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/locales";
import { useToast } from "@/hooks/use-toast";
import { ClaimStatus } from "@/types";

// Mock data
const mockClaim = {
  id: 1n,
  policyId: 1n,
  productId: 1n,
  productName: "Comprehensive Health Plan",
  claimant: "0x1234567890abcdef1234567890abcdef12345678",
  amount: 2500,
  diseaseType: "General Surgery",
  status: ClaimStatus.Verified,
  zkVerified: true,
  submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  policyStartDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  policyEndDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
  policyCoverage: 50000,
  documents: [
    { name: "medical_report.pdf", hash: "0xabc123..." },
    { name: "hospital_receipt.pdf", hash: "0xdef456..." },
  ],
  proofHash: "0x789abc...def123",
};

export default function InsurerClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useAccount();
  const { t } = useI18n();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "pay" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const claim = mockClaim;

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return (
          <Badge className="bg-warning/10 text-warning gap-1">
            <Clock className="h-3 w-3" />
            {t.claims.status.submitted}
          </Badge>
        );
      case ClaimStatus.Verified:
        return (
          <Badge className="bg-primary/10 text-primary gap-1">
            <Zap className="h-3 w-3" />
            {t.claims.status.verified}
          </Badge>
        );
      case ClaimStatus.Approved:
        return (
          <Badge className="bg-success/10 text-success gap-1">
            <CheckCircle className="h-3 w-3" />
            {t.claims.status.approved}
          </Badge>
        );
      case ClaimStatus.Rejected:
        return (
          <Badge className="bg-destructive/10 text-destructive gap-1">
            <XCircle className="h-3 w-3" />
            {t.claims.status.rejected}
          </Badge>
        );
      case ClaimStatus.Paid:
        return (
          <Badge className="bg-accent/10 text-accent gap-1">
            <DollarSign className="h-3 w-3" />
            {t.claims.status.paid}
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleAction = async (actionType: "approve" | "reject" | "pay") => {
    setIsProcessing(true);
    setAction(actionType);

    // Simulate contract call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setAction(null);

    const messages = {
      approve: "Claim approved successfully!",
      reject: "Claim rejected.",
      pay: "Payment processed successfully!",
    };

    toast({
      title: t.common.success,
      description: messages[actionType],
    });
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
          <p className="text-muted-foreground">Connect your wallet to review claims.</p>
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
          <Link to="/insurer/claims">
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
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
              <h1 className="font-display text-3xl font-bold">Review Claim #{id}</h1>
              {getStatusBadge(claim.status)}
            </div>
            <p className="text-muted-foreground">{claim.productName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t.claims.amount}</p>
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
          {/* ZK Verification Status */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">ZK Proof Verified ✓</h3>
                  <p className="text-muted-foreground text-sm">
                    The zero-knowledge proof has been cryptographically verified on-chain.
                    This claim is mathematically proven to be valid.
                  </p>
                </div>
                <Badge className="bg-success/10 text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Claim Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Claim Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Disease Type</h4>
                  <p className="font-medium">{claim.diseaseType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Claim Amount</h4>
                  <p className="font-medium text-lg">${claim.amount.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Submitted At</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{claim.submittedAt.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Verified At</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{claim.verifiedAt?.toLocaleString() || "Pending"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Uploaded Documents</h4>
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

          {/* Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Associated Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Policy ID</p>
                  <p className="font-medium">#{claim.policyId.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coverage</p>
                  <p className="font-medium">${claim.policyCoverage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{claim.policyEndDate.toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Claimant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Claimant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {claim.claimant}
              </code>
            </CardContent>
          </Card>

          {/* ZK Proof */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ZK Proof Hash</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {claim.proofHash}
              </code>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
              <CardDescription>Review and process this claim</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {claim.status === ClaimStatus.Verified && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full gap-2" disabled={isProcessing}>
                        {isProcessing && action === "approve" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4" />
                        )}
                        {t.insurer.approve}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Claim</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this claim for ${claim.amount.toLocaleString()}?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleAction("approve")}>
                          {t.common.confirm}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2" disabled={isProcessing}>
                        {isProcessing && action === "reject" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsDown className="h-4 w-4" />
                        )}
                        {t.insurer.reject}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Claim</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please provide a reason for rejecting this claim.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea
                          id="reason"
                          placeholder="Enter the reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAction("reject")}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Reject Claim
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {claim.status === ClaimStatus.Approved && (
                <Button
                  className="w-full gap-2 bg-success hover:bg-success/90"
                  disabled={isProcessing}
                  onClick={() => handleAction("pay")}
                >
                  {isProcessing && action === "pay" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Banknote className="h-4 w-4" />
                  )}
                  {t.insurer.pay}
                </Button>
              )}

              {(claim.status === ClaimStatus.Paid || claim.status === ClaimStatus.Rejected) && (
                <div className="text-center text-muted-foreground text-sm">
                  This claim has been processed.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
