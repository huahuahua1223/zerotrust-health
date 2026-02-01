import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
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
import { useI18n } from "@/locales";
import { ClaimStatus } from "@/types";

// Mock claims
const mockClaims = [
  {
    id: 1n,
    policyId: 1n,
    productName: "Basic Health Plan",
    claimant: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    amount: 2500_000000n,
    diseaseType: 2n,
    status: ClaimStatus.Paid,
    proofVerified: true,
    submittedAt: BigInt(Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60),
  },
  {
    id: 2n,
    policyId: 2n,
    productName: "Premium Health Plan",
    claimant: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    amount: 15000_000000n,
    diseaseType: 1n,
    status: ClaimStatus.Approved,
    proofVerified: true,
    submittedAt: BigInt(Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60),
  },
  {
    id: 3n,
    policyId: 1n,
    productName: "Basic Health Plan",
    claimant: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    amount: 1000_000000n,
    diseaseType: 4n,
    status: ClaimStatus.Submitted,
    proofVerified: true,
    submittedAt: BigInt(Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60),
  },
];

export default function MyClaims() {
  const { isConnected } = useAccount();
  const { t } = useI18n();

  const formatUSDT = (value: bigint) => {
    return parseFloat(formatUnits(value, 6)).toLocaleString();
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const getStatusInfo = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return {
          label: t.claims.status.submitted,
          icon: Clock,
          color: "text-warning",
          bg: "bg-warning/10",
        };
      case ClaimStatus.Verified:
        return {
          label: t.claims.status.verified,
          icon: CheckCircle2,
          color: "text-primary",
          bg: "bg-primary/10",
        };
      case ClaimStatus.Approved:
        return {
          label: t.claims.status.approved,
          icon: CheckCircle2,
          color: "text-success",
          bg: "bg-success/10",
        };
      case ClaimStatus.Rejected:
        return {
          label: t.claims.status.rejected,
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
        };
      case ClaimStatus.Paid:
        return {
          label: t.claims.status.paid,
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
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
          <p className="text-muted-foreground">Connect your wallet to view your claims.</p>
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
          <h1 className="mb-2 font-display text-3xl font-bold">{t.claims.title}</h1>
          <p className="text-muted-foreground">{t.claims.subtitle}</p>
        </div>
        <Button asChild className="gap-2 bg-gradient-primary hover:opacity-90">
          <Link to="/claim/new">
            <Plus className="h-4 w-4" />
            {t.nav.submitClaim}
          </Link>
        </Button>
      </motion.div>

      {/* Claims List */}
      {mockClaims.length > 0 ? (
        <div className="space-y-4">
          {mockClaims.map((claim, index) => {
            const statusInfo = getStatusInfo(claim.status);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={claim.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-hover overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusInfo.bg}`}>
                          <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              Claim #{claim.id.toString()}
                            </h3>
                            <Badge className={`${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </Badge>
                            {claim.proofVerified && (
                              <Badge variant="outline" className="gap-1">
                                <Shield className="h-3 w-3" />
                                {t.claims.zkVerified}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {claim.productName} • Policy #{claim.policyId.toString()}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="font-medium text-primary">
                              ${formatUSDT(claim.amount)}
                            </span>
                            <span className="text-muted-foreground">
                              {t.claims.submittedAt}: {formatDate(claim.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button asChild variant="outline" size="sm">
                        <Link to={`/claims/${claim.id.toString()}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </div>

                    {/* Status Timeline */}
                    <div className="mt-4 flex items-center gap-2 overflow-x-auto pt-4 border-t">
                      {[
                        ClaimStatus.Submitted,
                        ClaimStatus.Verified,
                        ClaimStatus.Approved,
                        ClaimStatus.Paid,
                      ].map((step, i) => {
                        const isActive = claim.status >= step;
                        const isRejected = claim.status === ClaimStatus.Rejected && step > ClaimStatus.Verified;
                        
                        return (
                          <div key={step} className="flex items-center">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                isRejected
                                  ? "bg-muted text-muted-foreground"
                                  : isActive
                                  ? "bg-success text-success-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isActive && !isRejected ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                i + 1
                              )}
                            </div>
                            {i < 3 && (
                              <div
                                className={`h-0.5 w-8 ${
                                  isActive && !isRejected ? "bg-success" : "bg-muted"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t.claims.noClaims}</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Submit a claim when you need medical coverage.
          </p>
          <Button asChild>
            <Link to="/claim/new">{t.nav.submitClaim}</Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
