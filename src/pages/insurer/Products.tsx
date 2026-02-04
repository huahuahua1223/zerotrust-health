import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  TrendingUp,
  Loader2,
  AlertCircle,
  Power,
  PowerOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useProducts, useProductPool, useFundPool, useSetProductActive, useTokenApprove, useTokenAllowance } from "@/hooks";
import { getContractAddress } from "@/config/contracts";
import type { Product } from "@/types";

export default function InsurerProducts() {
  const { address, isConnected, chainId } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [showFundDialog, setShowFundDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fundAmount, setFundAmount] = useState("");

  const { products, isLoading, error } = useProducts();
  
  // Filter products created by the current insurer
  const insurerProducts = products?.filter((p: Product) => 
    address && p.insurer.toLowerCase() === address.toLowerCase()
  ) || [];

  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  
  const { poolBalance } = useProductPool(selectedProduct?.id);
  const { fundPool, isPending: isFunding, isConfirming: isFundConfirming } = useFundPool();
  const { setProductActive, isPending: isToggling } = useSetProductActive();
  const { approve, isPending: isApproving } = useTokenApprove();
  const { allowance } = useTokenAllowance(insuranceManagerAddress);

  const handleFundPool = async () => {
    if (!selectedProduct || !fundAmount) return;
    
    const amountInWei = BigInt(parseFloat(fundAmount) * 1_000_000); // USDT has 6 decimals
    
    try {
      // Check if approval is needed
      if (!allowance || allowance < amountInWei) {
        await approve(insuranceManagerAddress, amountInWei);
        toast({
          title: t("common.success"),
          description: t("productDetail.approvalSuccess"),
        });
      }
      
      await fundPool(selectedProduct.id, amountInWei);
      toast({
        title: t("common.success"),
        description: `Added $${fundAmount} to Product #${selectedProduct.id.toString()} pool.`,
      });
      setShowFundDialog(false);
      setFundAmount("");
    } catch (err) {
      toast({
        title: t("errors.transactionFailed"),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await setProductActive(product.id, !product.active);
      toast({
        title: t("common.success"),
        description: product.active 
          ? t("insurer.productDeactivated")
          : t("insurer.productActivated"),
      });
    } catch (err) {
      toast({
        title: t("errors.transactionFailed"),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 font-display text-3xl font-bold">{t("insurer.products")}</h1>
          <p className="text-muted-foreground">
            {t("insurer.productsSubtitle")}
          </p>
        </div>
        <Button asChild className="gap-2 bg-gradient-primary hover:opacity-90">
          <Link to="/insurer/products/new">
            <Plus className="h-4 w-4" />
            {t("insurer.createProduct")}
          </Link>
        </Button>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <div className="h-1 bg-muted" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
                <Skeleton className="h-10" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h3 className="mb-2 text-lg font-semibold">{t("errors.loadingFailed")}</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && insurerProducts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {insurerProducts.map((product: Product, index: number) => (
            <motion.div
              key={product.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-hover h-full">
                <div className="h-1 bg-gradient-primary" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Product #{product.id.toString()}</CardTitle>
                      <CardDescription className="mt-1">
                        {t("common.notAvailable")}
                      </CardDescription>
                    </div>
                    {product.active ? (
                      <Badge className="bg-success/10 text-success">{t("common.active")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("common.inactive")}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("products.premium")}</p>
                      <p className="font-semibold">
                        ${(Number(product.premiumAmount) / 1_000_000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("products.coverage")}</p>
                      <p className="font-semibold">
                        ${(Number(product.maxCoverage) / 1_000_000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("products.duration")}</p>
                      <p className="font-semibold">
                        {product.coveragePeriodDays} {t("products.days")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("products.poolBalance")}</p>
                      <p className="font-semibold text-accent">
                        ${t("common.loading")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowFundDialog(true);
                      }}
                    >
                      <TrendingUp className="h-4 w-4" />
                      {t("insurer.fundPool")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleToggleActive(product)}
                      disabled={isToggling}
                    >
                      {product.active ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && insurerProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t("insurer.noProducts")}</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("insurer.noProductsDesc")}
          </p>
          <Button asChild>
            <Link to="/insurer/products/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("insurer.createProduct")}
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Fund Pool Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("insurer.fundPool")}</DialogTitle>
            <DialogDescription>
              Product #{selectedProduct?.id.toString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("insurer.currentBalance")}</span>
                <span className="font-semibold">
                  ${poolBalance ? (Number(poolBalance) / 1_000_000).toLocaleString() : "0"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("insurer.amountToAdd")}</Label>
              <Input
                type="number"
                placeholder={t("insurer.enterAmount")}
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFundDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleFundPool} 
              disabled={isFunding || isFundConfirming || isApproving || !fundAmount}
            >
              {isFunding || isFundConfirming || isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApproving ? t("productDetail.approving") : t("insurer.fundingPool")}
                </>
              ) : (
                t("insurer.fundPool")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
