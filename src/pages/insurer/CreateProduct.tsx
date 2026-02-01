import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Shield,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/locales";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  description: string;
  premium: string;
  coverage: string;
  duration: string;
  initialFunding: string;
}

export default function CreateProduct() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { t } = useI18n();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    premium: "",
    coverage: "",
    duration: "365",
    initialFunding: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.description.trim() !== "" &&
      Number(formData.premium) > 0 &&
      Number(formData.coverage) > 0 &&
      Number(formData.duration) > 0
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate contract call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setStep("success");

    toast({
      title: t.common.success,
      description: "Product created successfully!",
    });
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
          <p className="text-muted-foreground">Connect your wallet to create products.</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-lg text-center py-16"
        >
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Product Created!</h2>
          <p className="mb-6 text-muted-foreground">
            Your insurance product has been created successfully. Users can now purchase policies.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/insurer/products">View My Products</Link>
            </Button>
            <Button onClick={() => setStep("form")}>Create Another</Button>
          </div>
        </motion.div>
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
          <Link to="/insurer/products">
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
        <h1 className="font-display text-3xl font-bold">{t.insurer.createProduct}</h1>
        <p className="text-muted-foreground">
          Create a new insurance product for users to purchase
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {step === "form" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Product Details
                </CardTitle>
                <CardDescription>
                  Fill in the details for your new insurance product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Comprehensive Health Plan"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this insurance product covers..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <Separator />

                {/* Premium & Coverage */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="premium">Premium (USDT)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="premium"
                        type="number"
                        placeholder="500"
                        className="pl-9"
                        value={formData.premium}
                        onChange={(e) => handleInputChange("premium", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Amount users pay for the policy
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverage">Coverage Amount (USDT)</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="coverage"
                        type="number"
                        placeholder="50000"
                        className="pl-9"
                        value={formData.coverage}
                        onChange={(e) => handleInputChange("coverage", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum claim amount per policy
                    </p>
                  </div>
                </div>

                {/* Duration & Initial Funding */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Days)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="duration"
                        type="number"
                        placeholder="365"
                        className="pl-9"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Policy validity period
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialFunding">Initial Pool Funding (USDT)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="initialFunding"
                        type="number"
                        placeholder="100000"
                        className="pl-9"
                        value={formData.initialFunding}
                        onChange={(e) => handleInputChange("initialFunding", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional: Add initial funds to the pool
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button asChild variant="outline">
                    <Link to="/insurer/products">{t.common.cancel}</Link>
                  </Button>
                  <Button
                    onClick={() => setStep("confirm")}
                    disabled={!isFormValid()}
                  >
                    Continue to Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "confirm" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Review & Confirm
                </CardTitle>
                <CardDescription>
                  Please review the product details before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Product Name</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{formData.duration} days</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{formData.description}</p>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Premium</p>
                      <p className="font-medium">${Number(formData.premium).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className="font-medium">${Number(formData.coverage).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Initial Funding</p>
                      <p className="font-medium">
                        {formData.initialFunding
                          ? `$${Number(formData.initialFunding).toLocaleString()}`
                          : "None"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setStep("form")}>
                    {t.common.back}
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Help Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-base">Creating a Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Premium</h4>
                <p className="text-muted-foreground">
                  The amount users pay to purchase a policy. Set competitively based on coverage.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">Coverage</h4>
                <p className="text-muted-foreground">
                  Maximum amount a user can claim during the policy period.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">Pool Funding</h4>
                <p className="text-muted-foreground">
                  Initial liquidity to pay claims. You can add more funds later.
                </p>
              </div>
              <Separator />
              <div className="p-3 rounded-lg bg-warning/10 text-warning">
                <p className="text-xs">
                  ⚠️ Once created, product terms cannot be modified. Ensure all details are correct.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
