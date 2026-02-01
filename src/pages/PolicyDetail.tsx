import { useParams, Link } from "react-router-dom";
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
import { useI18n } from "@/locales";
import { PolicyStatus } from "@/types";

// Mock data
const mockPolicy = {
  id: 1n,
  productId: 1n,
  productName: "Comprehensive Health Plan",
  productDescription: "Full coverage for all medical expenses including hospitalization, surgery, and outpatient care.",
  holder: "0x1234567890abcdef1234567890abcdef12345678",
  premium: 500,
  coverage: 50000,
  startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endTime: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
  status: PolicyStatus.Active,
  claimsCount: 1,
  totalClaimedAmount: 2500,
};

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useAccount();
  const { t } = useI18n();

  const policy = mockPolicy;

  const getStatusBadge = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.Active:
        return (
          <Badge className="bg-success/10 text-success gap-1">
            <CheckCircle className="h-3 w-3" />
            {t.policies.status.active}
          </Badge>
        );
      case PolicyStatus.Expired:
        return (
          <Badge className="bg-muted text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            {t.policies.status.expired}
          </Badge>
        );
      case PolicyStatus.Cancelled:
        return (
          <Badge className="bg-destructive/10 text-destructive gap-1">
            <XCircle className="h-3 w-3" />
            {t.policies.status.cancelled}
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const daysRemaining = Math.ceil(
    (policy.endTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
          <p className="text-muted-foreground">Connect your wallet to view policy details.</p>
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
          <Link to="/my-policies">
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
              <h1 className="font-display text-3xl font-bold">Policy #{id}</h1>
              {getStatusBadge(policy.status)}
            </div>
            <p className="text-muted-foreground">{policy.productName}</p>
          </div>
          {policy.status === PolicyStatus.Active && (
            <Button asChild className="gap-2">
              <Link to="/claim/new">
                <FileText className="h-4 w-4" />
                {t.policies.fileClaim}
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
                Policy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Description */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Product Description</h4>
                <p className="text-foreground">{policy.productDescription}</p>
              </div>

              <Separator />

              {/* Coverage Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.products.premium}</p>
                    <p className="text-lg font-semibold">${policy.premium.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.products.coverage}</p>
                    <p className="text-lg font-semibold">${policy.coverage.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Start Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{policy.startTime.toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">End Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{policy.endTime.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Holder Address */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Policy Holder</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">{policy.holder}</code>
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
                <h3 className="text-2xl font-bold">
                  {daysRemaining > 0 ? daysRemaining : 0}
                </h3>
                <p className="text-muted-foreground">Days Remaining</p>
              </div>
            </CardContent>
          </Card>

          {/* Claims Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claims Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Claims</span>
                <span className="font-semibold">{policy.claimsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Claimed</span>
                <span className="font-semibold">${policy.totalClaimedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Coverage</span>
                <span className="font-semibold text-success">
                  ${(policy.coverage - policy.totalClaimedAmount).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to={`/products/${policy.productId}`}>
                  <Shield className="h-4 w-4" />
                  View Product Details
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/my-claims">
                  <FileText className="h-4 w-4" />
                  View My Claims
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
