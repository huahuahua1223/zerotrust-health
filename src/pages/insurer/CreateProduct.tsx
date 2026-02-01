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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      title: t("common.success"),
      description: t("createProduct.productCreatedDesc"),
    });
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("errors.walletNotConnected")}</h2>
          <p className="text-muted-foreground">{t("createProduct.connectToCreate")}</p>
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
          <h2 className="mb-2 text-2xl font-bold">{t("createProduct.productCreated")}</h2>
          <p className="mb-6 text-muted-foreground">
            {t("createProduct.productCreatedDesc")}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/insurer/products">{t("createProduct.viewMyProducts")}</Link>
            </Button>
            <Button onClick={() => setStep("form")}>{t("createProduct.createAnother")}</Button>
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
        <h1 className="font-display text-3xl font-bold">{t("insurer.createProduct")}</h1>
        <p className="text-muted-foreground">
          {t("createProduct.subtitle")}
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
                  {t("createProduct.productDetails")}
                </CardTitle>
                <CardDescription>
                  {t("createProduct.fillDetailsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">{t("createProduct.productNameLabel")}</Label>
                  <Input
                    id="name"
                    placeholder={t("createProduct.productNamePlaceholder")}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t("createProduct.descriptionLabel")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("createProduct.descriptionPlaceholder")}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <Separator />

                {/* Premium & Coverage */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="premium">{t("createProduct.premiumLabel")}</Label>
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
                      {t("createProduct.premiumHint")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverage">{t("createProduct.coverageLabel")}</Label>
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
                      {t("createProduct.coverageHint")}
                    </p>
                  </div>
                </div>

                {/* Duration & Initial Funding */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="duration">{t("createProduct.durationLabel")}</Label>
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
                      {t("createProduct.durationHint")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialFunding">{t("createProduct.initialFundingLabel")}</Label>
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
                      {t("createProduct.initialFundingHint")}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button asChild variant="outline">
                    <Link to="/insurer/products">{t("common.cancel")}</Link>
                  </Button>
                  <Button
                    onClick={() => setStep("confirm")}
                    disabled={!isFormValid()}
                  >
                    {t("createProduct.continueToReview")}
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
                  {t("createProduct.reviewAndConfirm")}
                </CardTitle>
                <CardDescription>
                  {t("createProduct.reviewDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("createProduct.productNameLabel")}</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("products.duration")}</p>
                      <p className="font-medium">{formData.duration} {t("products.days")}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">{t("createProduct.descriptionLabel")}</p>
                    <p className="font-medium">{formData.description}</p>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("products.premium")}</p>
                      <p className="font-medium">${Number(formData.premium).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("products.coverage")}</p>
                      <p className="font-medium">${Number(formData.coverage).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("createProduct.initialFunding")}</p>
                      <p className="font-medium">
                        {formData.initialFunding
                          ? `$${Number(formData.initialFunding).toLocaleString()}`
                          : t("createProduct.none")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setStep("form")}>
                    {t("common.back")}
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("insurer.creating")}
                      </>
                    ) : (
                      t("createProduct.createProduct")
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
              <CardTitle className="text-base">{t("createProduct.helpTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">{t("products.premium")}</h4>
                <p className="text-muted-foreground">
                  {t("createProduct.helpPremium")}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">{t("products.coverage")}</h4>
                <p className="text-muted-foreground">
                  {t("createProduct.helpCoverage")}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">{t("insurer.fundPool")}</h4>
                <p className="text-muted-foreground">
                  {t("createProduct.helpPool")}
                </p>
              </div>
              <Separator />
              <div className="p-3 rounded-lg bg-warning/10 text-warning">
                <p className="text-xs">
                  {t("createProduct.warningMessage")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
