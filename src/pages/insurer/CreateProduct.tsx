/**
 * Create Insurance Product Page
 * 创建保险产品页面（保险公司）
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Shield,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useCreateProductWithFunding, useTokenApprove } from "@/hooks";
import { getContractAddress } from "@/config/contracts";
import { parseContractError } from "@/lib/errors";
import { uploadMetadataToIPFS, type ProductMetadata } from "@/lib/ipfs";
import { buildCoveredTree } from "@/lib/zk/merkle";
import { usePublicClient } from "wagmi";
import { DISEASE_LIST } from "@/config/diseases";

interface ProductFormData {
  name: string;
  description: string;
  premium: string; // USDT
  coverage: string; // USDT
  duration: string; // 天数
  diseases: number[]; // 疾病 ID 列表
  initialFunding: string; // USDT
}

export default function CreateProduct() {
  const { isConnected, chainId } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // 使用翻译后的疾病列表
  const commonDiseases = DISEASE_LIST.map(disease => ({
    id: disease.id,
    name: t(disease.nameKey),
    category: t(disease.categoryKey),
  }));

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    premium: "",
    coverage: "",
    duration: "365",
    diseases: [101], // 默认至少一个疾病
    initialFunding: "",
  });

  const [newDiseaseId, setNewDiseaseId] = useState("");
  const [step, setStep] = useState<"form" | "generating" | "success">("form");
  const [isGeneratingTree, setIsGeneratingTree] = useState(false);

  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  const mockUSDTAddress = getContractAddress(chainId, "MockUSDT");
  const publicClient = usePublicClient();

  const { createProductWithFunding, isPending, isConfirming, isSuccess } = useCreateProductWithFunding();
  const { approve, isPending: isApproving } = useTokenApprove();

  // 监听交易确认成功
  useEffect(() => {
    if (isSuccess && step === "generating") {
      setStep("success");
      toast({
        title: t("common.success"),
        description: t("createProduct.productCreateSuccess"),
      });
    }
  }, [isSuccess, step, t, toast]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDisease = () => {
    const id = parseInt(newDiseaseId);
    if (id > 0 && !formData.diseases.includes(id)) {
      setFormData((prev) => ({
        ...prev,
        diseases: [...prev.diseases, id],
      }));
      setNewDiseaseId("");
    }
  };

  const handleRemoveDisease = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      diseases: prev.diseases.filter((_, i) => i !== index),
    }));
  };

  const toggleDiseaseSelection = (diseaseId: number) => {
    setFormData((prev) => {
      const isSelected = prev.diseases.includes(diseaseId);
      return {
        ...prev,
        diseases: isSelected
          ? prev.diseases.filter((id) => id !== diseaseId)
          : [...prev.diseases, diseaseId],
      };
    });
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.description.trim() !== "" &&
      Number(formData.premium) > 0 &&
      Number(formData.coverage) > 0 &&
      Number(formData.duration) > 0 &&
      formData.diseases.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: t("errors.invalidInput"),
        description: t("createProduct.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    try {
      setStep("generating");

      // 1. 生成 Merkle 树
      toast({
        title: t("createProduct.generatingMerkle"),
        description: t("createProduct.calculatingCoverage"),
      });

      setIsGeneratingTree(true);
      const merkleTree = await buildCoveredTree(formData.diseases);
      setIsGeneratingTree(false);

      const coveredRoot = `0x${merkleTree.root.toString(16).padStart(64, "0")}` as `0x${string}`;

      // 2. 创建产品元数据
      const metadata: ProductMetadata = {
        name: formData.name,
        description: formData.description,
        diseases: formData.diseases,
        category: t("createProduct.medicalInsurance"),
      };

      // 3. 上传元数据到 IPFS（自动降级到 data URI）
      toast({
        title: t("createProduct.uploadingMetadata"),
        description: t("createProduct.uploadingToIpfs"),
      });

      const { ipfsUri } = await uploadMetadataToIPFS(metadata);

      // 4. 准备合约参数
      const premiumAmount = BigInt(Math.floor(parseFloat(formData.premium) * 1_000_000));
      const maxCoverage = BigInt(Math.floor(parseFloat(formData.coverage) * 1_000_000));
      const coveragePeriodDays = parseInt(formData.duration);
      const fundingAmount = formData.initialFunding && parseFloat(formData.initialFunding) > 0
        ? BigInt(Math.floor(parseFloat(formData.initialFunding) * 1_000_000))
        : 0n;

      // 5. 如果有初始注资，先执行 approve 并等待确认
      if (fundingAmount > 0n) {
        toast({
          title: t("createProduct.approveToken"),
          description: t("createProduct.approvingUsdt"),
        });

        // 调用 approve 发起交易，获取交易哈希
        const approveHash = await approve(insuranceManagerAddress, fundingAmount);
        
        toast({
          title: t("createProduct.waitingConfirmation"),
          description: t("createProduct.approveConfirming"),
        });
        
        // 等待 approve 交易被区块链确认
        if (approveHash) {
          if (publicClient) {
            await publicClient.waitForTransactionReceipt({ 
              hash: approveHash,
              confirmations: 1 
            });
          } else {
            // 降级方案：等待 3 秒
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }

      // 6. 调用合约创建产品（合并注资操作）
      toast({
        title: t("createProduct.creatingProduct"),
        description: fundingAmount > 0n 
          ? t("createProduct.creatingWithFunding")
          : t("createProduct.submittingToChain"),
      });

      await createProductWithFunding(
        mockUSDTAddress,
        premiumAmount,
        maxCoverage,
        coveragePeriodDays,
        coveredRoot,
        ipfsUri,
        fundingAmount
      );

      // 7. 等待交易确认（注意：这里不要直接标记成功，使用 useEffect 监听 isSuccess）
    } catch (err) {
      setStep("form");
      const parsed = parseContractError(err);
      toast({
        title: parsed.title,
        description: parsed.message,
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
          <p className="text-muted-foreground">{t("createProduct.connectWalletFirst")}</p>
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
            className="mx-auto max-w-lg py-16 text-center"
          >
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">{t("createProduct.productCreatedSuccessTitle")}</h2>
            <p className="mb-6 text-muted-foreground">
              {t("createProduct.productCreatedSuccessDesc")}
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link to="/insurer/products">{t("createProduct.viewMyProductsBtn")}</Link>
              </Button>
              <Button
                onClick={() => {
                  setStep("form");
                  setFormData({
                    name: "",
                    description: "",
                    premium: "",
                    coverage: "",
                    duration: "365",
                    diseases: [101],
                    initialFunding: "",
                  });
                }}
              >
                {t("createProduct.createAnotherProduct")}
              </Button>
            </div>
          </motion.div>
        </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="mb-2 text-xl font-semibold">
            {isGeneratingTree ? t("createProduct.generatingOrCreating") : t("createProduct.creatingProduct")}
          </h2>
          <p className="text-muted-foreground">
            {isGeneratingTree
              ? t("createProduct.calculatingOrSubmitting")
              : t("createProduct.submittingToChain")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/insurer/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold">{t("createProduct.creatingInsurance")}</h1>
              <p className="text-muted-foreground">{t("createProduct.configureProduct")}</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("createProduct.productInfo")}
              </CardTitle>
              <CardDescription>{t("createProduct.productInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("createProduct.productNameRequired")}</Label>
                  <Input
                    id="name"
                    placeholder={t("createProduct.productNamePlaceholderExample")}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t("createProduct.productDescRequired")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("createProduct.productDescPlaceholderExample")}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* 保险条款 */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <DollarSign className="h-5 w-5" />
                  {t("createProduct.insuranceTerms")}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="premium">{t("createProduct.premiumRequired")}</Label>
                    <Input
                      id="premium"
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={formData.premium}
                      onChange={(e) => handleInputChange("premium", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverage">{t("createProduct.coverageRequired")}</Label>
                    <Input
                      id="coverage"
                      type="number"
                      step="0.01"
                      placeholder="10000.00"
                      value={formData.coverage}
                      onChange={(e) => handleInputChange("coverage", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">{t("createProduct.durationRequired")}</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="365"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("createProduct.durationHintDays", { duration: formData.duration })}
                  </p>
                </div>
              </div>

              <Separator />

              {/* 疾病覆盖范围 */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5" />
                  {t("createProduct.diseaseCoverage")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("createProduct.diseaseCoverageDesc")}
                </p>

                {/* 快速选择常见疾病 */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">{t("createProduct.quickSelectDiseases")}</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {commonDiseases.map((disease) => {
                      const isSelected = formData.diseases.includes(disease.id);
                      return (
                        <Button
                          key={disease.id}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDiseaseSelection(disease.id)}
                          className="justify-start"
                        >
                          {disease.name} ({disease.id})
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* 手动输入疾病 ID */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">{t("createProduct.manualInputDiseaseId")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t("createProduct.diseaseIdPlaceholder")}
                      value={newDiseaseId}
                      onChange={(e) => setNewDiseaseId(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDisease();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddDisease} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 已选择的疾病 */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    {t("createProduct.selectedDiseasesCount", { count: formData.diseases.length })}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.diseases.map((diseaseId, index) => {
                      const disease = commonDiseases.find((d) => d.id === diseaseId);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1 text-sm"
                        >
                          <span>
                            {disease ? `${disease.name} (${diseaseId})` : t("createProduct.diseaseLabel", { id: diseaseId })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDisease(index)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              {/* 初始注资（可选） */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  {t("createProduct.initialFundingOptional")}
                </h3>

                <div>
                  <Label htmlFor="initialFunding">{t("createProduct.fundingAmountLabel")}</Label>
                  <Input
                    id="initialFunding"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={formData.initialFunding}
                    onChange={(e) => handleInputChange("initialFunding", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("createProduct.fundingHint")}
                  </p>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/insurer/products">{t("createProduct.cancelBtn")}</Link>
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isPending || isConfirming || isApproving}
                  className="gap-2"
                >
                  {isPending || isConfirming || isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("createProduct.creatingBtn")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      {t("createProduct.createProductBtn")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 信息提示 */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 text-primary" />
                {t("createProduct.importantNotice")}
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {t("createProduct.noticeItem1")}</li>
                <li>• {t("createProduct.noticeItem2")}</li>
                <li>• {t("createProduct.noticeItem3")}</li>
                <li>• {t("createProduct.noticeItem4")}</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
