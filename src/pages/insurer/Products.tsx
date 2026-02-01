import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  TrendingUp,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/locales";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types";

// Mock products
const mockInsurerProducts: (Product & { soldPolicies: number })[] = [
  {
    id: 1n,
    name: "Basic Health Plan",
    description: "Essential coverage for common illnesses",
    premium: 100_000000n,
    coverageAmount: 10000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 50000_000000n,
    soldPolicies: 45,
  },
  {
    id: 2n,
    name: "Premium Health Plan",
    description: "Comprehensive coverage including major surgeries",
    premium: 500_000000n,
    coverageAmount: 100000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 250000_000000n,
    soldPolicies: 82,
  },
];

export default function InsurerProducts() {
  const { isConnected } = useAccount();
  const { t } = useI18n();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    premium: "",
    coverageAmount: "",
    duration: "365",
  });

  const handleCreateProduct = async () => {
    setIsCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Product Created!",
      description: `${newProduct.name} has been created successfully.`,
    });
    setIsCreating(false);
    setShowCreateDialog(false);
    setNewProduct({
      name: "",
      description: "",
      premium: "",
      coverageAmount: "",
      duration: "365",
    });
  };

  const handleFundPool = async () => {
    setIsFunding(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Pool Funded!",
      description: `Added $${fundAmount} to ${selectedProduct?.name} pool.`,
    });
    setIsFunding(false);
    setShowFundDialog(false);
    setFundAmount("");
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
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
          <h1 className="mb-2 font-display text-3xl font-bold">{t.insurer.products}</h1>
          <p className="text-muted-foreground">
            Create and manage your insurance products.
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4" />
              {t.insurer.createProduct}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new insurance product.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  placeholder="e.g., Basic Health Plan"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this product covers..."
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Premium (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={newProduct.premium}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, premium: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coverage (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={newProduct.coverageAmount}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, coverageAmount: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  placeholder="365"
                  value={newProduct.duration}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, duration: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleCreateProduct} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockInsurerProducts.map((product, index) => (
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
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {product.description}
                    </CardDescription>
                  </div>
                  {product.isActive ? (
                    <Badge className="bg-success/10 text-success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Premium</p>
                    <p className="font-semibold">
                      ${(Number(product.premium) / 1000000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coverage</p>
                    <p className="font-semibold">
                      ${(Number(product.coverageAmount) / 1000000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Policies Sold</p>
                    <p className="font-semibold">{product.soldPolicies}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pool Balance</p>
                    <p className="font-semibold text-accent">
                      ${(Number(product.poolBalance) / 1000000).toLocaleString()}
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
                    Fund Pool
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Fund Pool Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund Pool</DialogTitle>
            <DialogDescription>
              Add funds to {selectedProduct?.name} insurance pool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-semibold">
                  ${selectedProduct && (Number(selectedProduct.poolBalance) / 1000000).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount (USDT)</Label>
              <Input
                type="number"
                placeholder="Enter amount to add"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFundDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleFundPool} disabled={isFunding || !fundAmount}>
              {isFunding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Fund Pool"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
