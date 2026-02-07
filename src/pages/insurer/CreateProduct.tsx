/**
 * Create Insurance Product Page
 * 创建保险产品页面（保险公司）
 */

import { useState, useEffect, useMemo } from "react";
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
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

  const [step, setStep] = useState<"form" | "generating" | "success">("form");
  const [isGeneratingTree, setIsGeneratingTree] = useState(false);
  const [diseaseSearch, setDiseaseSearch] = useState("");

  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  const mockUSDTAddress = getContractAddress(chainId, "MockUSDT");
  const publicClient = usePublicClient();

  const { createProductWithFunding, isPending, isConfirming, isSuccess } = useCreateProductWithFunding();
  const { approve, isPending: isApproving } = useTokenApprove();

  // 按分类分组疾病
  const diseasesByCategory = useMemo(() => {
    const categories: Record<string, typeof commonDiseases> = {
      infectious: [],
      chronic: [],
      injury: [],
      other: [],
    };
    
    commonDiseases.forEach((disease) => {
      const categoryKey = disease.category.toLowerCase().includes('传染') || disease.category.toLowerCase().includes('infectious') 
        ? 'infectious'
        : disease.category.toLowerCase().includes('慢性') || disease.category.toLowerCase().includes('chronic')
        ? 'chronic'
        : disease.category.toLowerCase().includes('外伤') || disease.category.toLowerCase().includes('injury')
        ? 'injury'
        : 'other';
      categories[categoryKey].push(disease);
    });
    
    return categories;
  }, [commonDiseases]);

  // 过滤疾病列表
  const filteredDiseases = useMemo(() => {
    if (!diseaseSearch.trim()) return diseasesByCategory;
    
    const search = diseaseSearch.toLowerCase();
    const filtered: typeof diseasesByCategory = {
      infectious: [],
      chronic: [],
      injury: [],
      other: [],
    };
    
    Object.entries(diseasesByCategory).forEach(([category, diseases]) => {
      filtered[category] = diseases.filter((disease) =>
        disease.name.toLowerCase().includes(search) ||
        disease.id.toString().includes(search)
      );
    });
    
    return filtered;
  }, [diseasesByCategory, diseaseSearch]);

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
    <div className="container max-w-7xl py-8">
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

        {/* 左右双栏布局 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧主内容区 */}
          <div className="w-full lg:w-[60%] space-y-6">
            {/* Card: 产品信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("createProduct.productInfo")}
                </CardTitle>
                <CardDescription>{t("createProduct.productInfoDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("createProduct.productNameRequired")}</Label>
                  <Input
                    id="name"
                    placeholder={t("createProduct.productNamePlaceholderExample")}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("createProduct.hints.name")}
                  </p>
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
              </CardContent>
            </Card>

            {/* Card: 保险条款 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t("createProduct.insuranceTerms")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("createProduct.hints.premium")}
                    </p>
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
                    {t("createProduct.hints.duration")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card: 疾病覆盖范围 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("createProduct.diseaseCoverage")}
                </CardTitle>
                <CardDescription>{t("createProduct.diseaseCoverageDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("createProduct.searchDiseases")}
                    value={diseaseSearch}
                    onChange={(e) => setDiseaseSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 疾病分类 Accordion */}
                <div className="max-h-96 overflow-y-auto rounded-lg border">
                  <Accordion type="multiple" defaultValue={["infectious", "chronic"]}>
                    {Object.entries(filteredDiseases).map(([categoryKey, diseases]) => {
                      if (diseases.length === 0) return null;
                      
                      const selectedCount = diseases.filter(d => formData.diseases.includes(d.id)).length;
                      
                      return (
                        <AccordionItem key={categoryKey} value={categoryKey}>
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">
                                {t(`createProduct.diseaseCategories.${categoryKey}`)}
                              </span>
                              <Badge variant="secondary">
                                {selectedCount}/{diseases.length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="grid gap-2 sm:grid-cols-2">
                              {diseases.map((disease) => {
                                const isSelected = formData.diseases.includes(disease.id);
                                return (
                                  <div key={disease.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`disease-${disease.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() => toggleDiseaseSelection(disease.id)}
                                    />
                                    <label
                                      htmlFor={`disease-${disease.id}`}
                                      className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {disease.name} ({disease.id})
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>

                {/* 已选择疾病统计 */}
                {formData.diseases.length > 0 && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <p className="text-sm font-medium text-primary">
                      {t("createProduct.selectedDiseasesCount", { count: formData.diseases.length })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: 初始资金池注资 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("createProduct.initialFundingOptional")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="initialFunding">{t("createProduct.fundingAmountLabel")}</Label>
                  <Input
                    id="initialFunding"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.initialFunding}
                    onChange={(e) => handleInputChange("initialFunding", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("createProduct.hints.funding")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧Sticky侧边栏 */}
          <div className="w-full lg:w-[40%] space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Card: 产品预览 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{t("createProduct.productPreview")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 产品卡片预览 */}
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-6 space-y-3">
                    <h3 className="font-semibold text-lg">
                      {formData.name || t("createProduct.productNamePlaceholderExample")}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.description || t("createProduct.productDescPlaceholderExample")}
                    </p>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">{t("createProduct.premiumLabel")}</p>
                        <p className="font-semibold text-primary">
                          {formData.premium ? `$${formData.premium}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">{t("createProduct.coverageLabel")}</p>
                        <p className="font-semibold">
                          {formData.coverage ? `$${formData.coverage}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">{t("createProduct.durationLabel")}</p>
                        <p className="font-semibold">
                          {formData.duration ? `${formData.duration} ${t("common.days")}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">{t("createProduct.selectedDiseases")}</p>
                        <p className="font-semibold text-primary">
                          {formData.diseases.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card: 疾病覆盖统计 */}
              {formData.diseases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("createProduct.coverageStats")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(diseasesByCategory).map(([categoryKey, diseases]) => {
                        const selectedInCategory = diseases.filter(d => formData.diseases.includes(d.id)).length;
                        if (selectedInCategory === 0) return null;
                        
                        return (
                          <div key={categoryKey} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {t(`createProduct.diseaseCategories.${categoryKey}`)}
                            </span>
                            <Badge variant="secondary">
                              {selectedInCategory}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sticky Button: 创建产品 */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isPending || isApproving || isConfirming}
                className="w-full"
                size="lg"
              >
                {isPending || isApproving || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isApproving ? t("createProduct.creatingBtn") : t("createProduct.creatingProduct")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {t("createProduct.createProductBtn")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
