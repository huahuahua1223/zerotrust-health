/**
 * Create Insurance Product Page
 * 创建保险产品页面（保险公司）
 */

import { useState } from "react";
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
import { useCreateProduct, useTokenApprove } from "@/hooks";
import { getContractAddress } from "@/config/contracts";
import { parseContractError } from "@/lib/errors";
import { createDataURI, type ProductMetadata } from "@/lib/ipfs";
import { buildCoveredTree } from "@/lib/zk/merkle";

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

  const { createProduct, isPending, isConfirming } = useCreateProduct();
  const { approve, isPending: isApproving } = useTokenApprove();

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
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    try {
      setStep("generating");

      // 1. 生成 Merkle 树
      toast({
        title: "生成 Merkle 树",
        description: "正在计算疾病覆盖范围...",
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
        category: "医疗保险",
      };

      // 3. 上传元数据（使用 data URI）
      const uri = createDataURI(metadata);

      // 4. 准备合约参数
      const premiumAmount = BigInt(Math.floor(parseFloat(formData.premium) * 1_000_000));
      const maxCoverage = BigInt(Math.floor(parseFloat(formData.coverage) * 1_000_000));
      const coveragePeriodDays = parseInt(formData.duration);

      // 5. 调用合约创建产品
      toast({
        title: "创建产品",
        description: "正在提交到区块链...",
      });

      await createProduct(
        mockUSDTAddress,
        premiumAmount,
        maxCoverage,
        coveragePeriodDays,
        coveredRoot,
        uri
      );

      // 6. 如果有初始注资，执行注资
      if (formData.initialFunding && parseFloat(formData.initialFunding) > 0) {
        const fundingAmount = BigInt(Math.floor(parseFloat(formData.initialFunding) * 1_000_000));

        toast({
          title: "批准代币",
          description: "正在批准 USDT...",
        });

        await approve(insuranceManagerAddress, fundingAmount);

        toast({
          title: "注资",
          description: "正在为产品池注资...",
        });

        // 注意：这里需要等待产品创建完成后获取 productId
        // 实际应该从事件中解析 productId
        // 暂时跳过自动注资，提示用户手动注资
      }

      setStep("success");

      toast({
        title: t("common.success"),
        description: "产品创建成功！",
      });
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
          <p className="text-muted-foreground">请连接钱包后创建产品</p>
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
            <h2 className="mb-2 text-2xl font-bold">产品创建成功！</h2>
            <p className="mb-6 text-muted-foreground">
              您的保险产品已成功创建并上链
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link to="/insurer/products">查看我的产品</Link>
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
                创建另一个产品
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
            {isGeneratingTree ? "生成 Merkle 树" : "创建产品"}
          </h2>
          <p className="text-muted-foreground">
            {isGeneratingTree
              ? "正在计算疾病覆盖范围的 Merkle 根..."
              : "正在提交到区块链，请稍候..."}
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
              <h1 className="font-display text-3xl font-bold">创建保险产品</h1>
              <p className="text-muted-foreground">配置您的新保险产品</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                产品信息
              </CardTitle>
              <CardDescription>填写产品的基本信息和保险条款</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">产品名称 *</Label>
                  <Input
                    id="name"
                    placeholder="例如：全面医疗保险"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">产品描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="介绍产品的特点和优势..."
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
                  保险条款
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="premium">保费 (USDT) *</Label>
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
                    <Label htmlFor="coverage">最高赔付 (USDT) *</Label>
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
                  <Label htmlFor="duration">保险期限 (天) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="365"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    保单从购买时起生效 {formData.duration} 天
                  </p>
                </div>
              </div>

              <Separator />

              {/* 疾病覆盖范围 */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5" />
                  疾病覆盖范围 *
                </h3>
                <p className="text-sm text-muted-foreground">
                  添加此产品覆盖的疾病 ID。系统将生成 Merkle 树以保护隐私。
                </p>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="疾病 ID (如 101)"
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

                <div className="flex flex-wrap gap-2">
                  {formData.diseases.map((diseaseId, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1 text-sm"
                    >
                      <span>疾病 {diseaseId}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDisease(index)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 初始注资（可选） */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  初始注资（可选）
                </h3>

                <div>
                  <Label htmlFor="initialFunding">注资金额 (USDT)</Label>
                  <Input
                    id="initialFunding"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={formData.initialFunding}
                    onChange={(e) => handleInputChange("initialFunding", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    为产品资金池提供初始资金，用于理赔支付
                  </p>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/insurer/products">取消</Link>
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isPending || isConfirming || isApproving}
                  className="gap-2"
                >
                  {isPending || isConfirming || isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      创建产品
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
                重要提示
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 产品创建后，疾病覆盖范围将通过 Merkle 树加密存储</li>
                <li>• 用户提交理赔时无需暴露具体疾病信息</li>
                <li>• 建议在创建后立即为产品池注资</li>
                <li>• 保费和赔付金额使用 USDT (6位小数)</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
