import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Package,
  FileText,
  Shield,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/locales";
import { useUserRoles } from "@/hooks";
import { ClaimStatus } from "@/types";

// Mock data
const mockStats = {
  totalProducts: 5,
  activePolicies: 127,
  pendingClaims: 8,
  totalPoolBalance: 850000,
};

const mockRecentClaims = [
  {
    id: 1n,
    claimant: "0x1234...5678",
    amount: 2500,
    status: ClaimStatus.Submitted,
    submittedAt: "2 hours ago",
  },
  {
    id: 2n,
    claimant: "0x2345...6789",
    amount: 15000,
    status: ClaimStatus.Verified,
    submittedAt: "5 hours ago",
  },
  {
    id: 3n,
    claimant: "0x3456...7890",
    amount: 8000,
    status: ClaimStatus.Submitted,
    submittedAt: "1 day ago",
  },
];

export default function InsurerDashboard() {
  const { isConnected } = useAccount();
  const { t } = useI18n();
  const { isInsurer, isLoading } = useUserRoles();

  const stats = [
    {
      title: "My Products",
      value: mockStats.totalProducts,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Policies",
      value: mockStats.activePolicies,
      icon: Shield,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Pending Claims",
      value: mockStats.pendingClaims,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Total Pool Balance",
      value: `$${mockStats.totalPoolBalance.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return <Badge className="bg-warning/10 text-warning">Pending Review</Badge>;
      case ClaimStatus.Verified:
        return <Badge className="bg-primary/10 text-primary">ZK Verified</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
          <p className="text-muted-foreground">Connect your wallet to access the insurer panel.</p>
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
        className="mb-8"
      >
        <h1 className="mb-2 font-display text-3xl font-bold">{t.insurer.dashboard}</h1>
        <p className="text-muted-foreground">
          Manage your insurance products, policies, and claims.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card className="card-hover bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t.insurer.createProduct}</h3>
                <p className="text-sm text-muted-foreground">
                  Launch a new insurance product
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/insurer/products/new">Create</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <FileText className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t.insurer.claims}</h3>
                <p className="text-sm text-muted-foreground">
                  {mockStats.pendingClaims} claims awaiting review
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/insurer/claims">Review</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t.insurer.fundPool}</h3>
                <p className="text-sm text-muted-foreground">
                  Add funds to your product pools
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/insurer/products">Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Claims */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Claims</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/insurer/claims">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentClaims.map((claim) => (
                <div
                  key={claim.id.toString()}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Claim #{claim.id.toString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {claim.claimant} • {claim.submittedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${claim.amount.toLocaleString()}</p>
                      {getStatusBadge(claim.status)}
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/insurer/claims/${claim.id.toString()}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
