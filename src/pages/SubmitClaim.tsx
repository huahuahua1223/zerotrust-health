import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileText,
  Upload,
  Lock,
  Send,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useClaimFormStore } from "@/store";
import { useUserPoliciesWithDetails, useSubmitClaimWithProof, useZKProof } from "@/hooks";
import { PolicyStatus } from "@/types";
import { parseContractError } from "@/lib/errors";
import { fetchProductMetadata } from "@/lib/ipfs";
import { DISEASE_LIST, getDiseaseById } from "@/config/diseases";

const STEPS = [
  { icon: Shield, key: "selectPolicy" },
  { icon: FileText, key: "claimDetails" },
  { icon: Upload, key: "uploadDocuments" },
  { icon: Lock, key: "generateProof" },
  { icon: Send, key: "review" },
] as const;

export default function SubmitClaim() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);

  const { policies, isLoading: isPoliciesLoading } = useUserPoliciesWithDetails();
  const { submitClaim, isPending, isConfirming } = useSubmitClaimWithProof();
  const { generateProof: generateZKProof, statusMessage, isGenerating } = useZKProof({
    onSuccess: (result) => {
      // Convert proof to string format for store
      setZKProof(
        {
          a: result.proof.a.map(v => v.toString()) as [string, string],
          b: result.proof.b.map(row => 
            row.map(v => v.toString())
          ) as [[string, string], [string, string]],
          c: result.proof.c.map(v => v.toString()) as [string, string],
        },
        result.publicInputs.map(v => v.toString())
      );
    },
    onError: (error) => {
      toast({
        title: t("errors.proofGenerationFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter only active policies
  const activePolicies = useMemo(() => {
    return policies?.filter(p => p.status === PolicyStatus.Active) || [];
  }, [policies]);

  const {
    selectedPolicyId,
    setSelectedPolicy,
    diseaseType,
    setDiseaseType,
    claimAmount,
    setClaimAmount,
    uploadedFiles,
    addUploadedFile,
    removeUploadedFile,
    zkProof,
    publicInputs,
    setZKProof,
    reset,
  } = useClaimFormStore();

  const selectedPolicy = activePolicies.find(
    (p) => p.id === selectedPolicyId
  );

  // 当前所选保单产品的覆盖疾病（用于下拉选项，仅显示该产品覆盖的疾病）
  const [coveredDiseases, setCoveredDiseases] = useState<{ id: number; nameKey: string }[]>([]);
  const [isLoadingCoveredDiseases, setIsLoadingCoveredDiseases] = useState(false);

  useEffect(() => {
    const product = selectedPolicy?.product;
    if (!selectedPolicyId || !product?.uri) {
      setCoveredDiseases([]);
      return;
    }
    let cancelled = false;
    setIsLoadingCoveredDiseases(true);
    const currentDiseaseType = diseaseType;
    fetchProductMetadata(product.uri)
      .then((metadata) => {
        if (cancelled) return;
        const ids = metadata?.diseases ?? [];
        const list = DISEASE_LIST.filter((d) => ids.includes(d.id)).map((d) => ({
          id: d.id,
          nameKey: d.nameKey,
        }));
        setCoveredDiseases(list);
        if (list.length === 0) {
          setDiseaseType(0);
        } else if (!list.some((d) => d.id === currentDiseaseType)) {
          setDiseaseType(list[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setCoveredDiseases([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCoveredDiseases(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPolicyId, selectedPolicy?.product?.uri]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => addUploadedFile(file));
    }
  };

  const generateProof = async () => {
    if (!selectedPolicyId || !claimAmount) return;
    const product = selectedPolicy?.product;
    if (!product) {
      toast({
        title: t("errors.generic"),
        description: t("claimForm.policyProductFetchFailed"),
        variant: "destructive",
      });
      return;
    }
    // 从产品元数据获取覆盖疾病列表（须与创建产品时一致，用于构建 Merkle 树）
    let diseaseIds: number[];
    try {
      const metadata = await fetchProductMetadata(product.uri);
      diseaseIds = metadata?.diseases ?? [];
    } catch {
      toast({
        title: t("errors.generic"),
        description: t("claimForm.coverageFetchFailed"),
        variant: "destructive",
      });
      return;
    }
    if (!diseaseIds.length) {
      toast({
        title: t("errors.generic"),
        description: t("claimForm.noCoveredDiseasesForProof"),
        variant: "destructive",
      });
      return;
    }
    if (!diseaseIds.includes(diseaseType)) {
      toast({
        title: t("errors.generic"),
        description: t("claimForm.diseaseNotInCoverage"),
        variant: "destructive",
      });
      return;
    }

    const amountInWei = BigInt(parseFloat(claimAmount) * 1_000_000);
    const documentHash = uploadedFiles.length > 0
      ? "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      : "0x" + "0".repeat(64);

    await generateZKProof({
      policyId: selectedPolicyId,
      claimAmount: amountInWei,
      diseaseId: diseaseType,
      documentHash,
      coveredRoot: product.coveredRoot,
      diseaseIds,
    });
  };

  const handleSubmit = async () => {
    if (!selectedPolicyId || !zkProof || !claimAmount || publicInputs.length !== 5) {
      toast({
        title: t("claimForm.dataIncomplete"),
        description: t("claimForm.ensureProofGenerated"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 从 publicInputs 中提取数据
      const [policyIdFromProof, amountFromProof, dataHashField, _, nullifierFromProof] = publicInputs;
      
      // Convert string proof to bigint for contract
      const proofForContract = {
        a: [BigInt(zkProof.a[0]), BigInt(zkProof.a[1])] as [bigint, bigint],
        b: [
          [BigInt(zkProof.b[0][0]), BigInt(zkProof.b[0][1])],
          [BigInt(zkProof.b[1][0]), BigInt(zkProof.b[1][1])],
        ] as [[bigint, bigint], [bigint, bigint]],
        c: [BigInt(zkProof.c[0]), BigInt(zkProof.c[1])] as [bigint, bigint],
      };
      
      const publicInputsForContract = publicInputs.map(s => BigInt(s)) as [bigint, bigint, bigint, bigint, bigint];
      
      // 从证明结果中获取 dataHash 和 nullifier
      const dataHash = `0x${BigInt(dataHashField).toString(16).padStart(64, '0')}` as `0x${string}`;
      const nullifier = `0x${BigInt(nullifierFromProof).toString(16).padStart(64, '0')}` as `0x${string}`;
      
      await submitClaim(
        BigInt(policyIdFromProof),
        BigInt(amountFromProof),
        dataHash,
        nullifier,
        proofForContract,
        publicInputsForContract
      );
      
      toast({
        title: t("common.success"),
        description: t("claimForm.submitSuccess"),
      });
      reset();
      navigate("/my-claims");
    } catch (err) {
      const parsed = parseContractError(err);
      toast({
        title: parsed.title || t("claimForm.submitFailed"),
        description: parsed.action || parsed.message || t("claimForm.pleaseRetry"),
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedPolicyId !== null;
      case 1:
        return (
          diseaseType > 0 &&
          coveredDiseases.some((d) => d.id === diseaseType) &&
          !!claimAmount &&
          parseFloat(claimAmount) > 0
        );
      case 2:
        return uploadedFiles.length > 0;
      case 3:
        return zkProof !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t('errors.walletNotConnected')}</h2>
          <p className="text-muted-foreground">{t('claimForm.connectToSubmit')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 font-display text-3xl font-bold">{t('claimForm.title')}</h1>
        <p className="text-muted-foreground">
          {t('claimForm.subtitle')}
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      isCompleted
                        ? "bg-success text-success-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs ${
                      isActive ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t(`claimForm.steps.${step.key}`)}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-8 sm:w-16 ${
                      index < currentStep ? "bg-success" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={((currentStep + 1) / STEPS.length) * 100} className="mt-4 h-1" />
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = STEPS[currentStep].icon;
                  return <StepIcon className="h-5 w-5" />;
                })()}
                {t(`claimForm.steps.${STEPS[currentStep].key}`)}
              </CardTitle>
              <CardDescription>
                {currentStep === 0 && t('claimForm.selectPolicyDesc')}
                {currentStep === 1 && t('claimForm.claimDetailsDesc')}
                {currentStep === 2 && t('claimForm.uploadDocumentsDesc')}
                {currentStep === 3 && t('claimForm.generateProofDesc')}
                {currentStep === 4 && t('claimForm.reviewDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Select Policy */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  {isPoliciesLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : activePolicies.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">{t('claimForm.noActivePolicies')}</p>
                    </div>
                  ) : (
                    activePolicies.map((policy) => (
                      <div
                        key={policy.id.toString()}
                        onClick={() => setSelectedPolicy(policy.id)}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          selectedPolicyId === policy.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{t('common.policyPrefix')}{policy.id.toString()}</h4>
                            <p className="text-sm text-muted-foreground">
                              {t('common.productPrefix')}{policy.productId.toString()}
                            </p>
                          </div>
                          <div
                            className={`h-5 w-5 rounded-full border-2 ${
                              selectedPolicyId === policy.id
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {selectedPolicyId === policy.id && (
                              <CheckCircle2 className="h-full w-full text-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Step 2: Claim Details（疾病选项仅显示当前保单产品覆盖范围） */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('claimForm.diseaseType')}</Label>
                    {!selectedPolicyId ? (
                      <p className="text-sm text-muted-foreground">{t('claimForm.selectPolicyFirst')}</p>
                    ) : isLoadingCoveredDiseases ? (
                      <Skeleton className="h-10 w-full" />
                    ) : coveredDiseases.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('claimForm.noCoveredDiseases')}</p>
                    ) : (
                      <Select
                        value={diseaseType > 0 ? diseaseType.toString() : undefined}
                        onValueChange={(v) => setDiseaseType(parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('claimForm.selectDiseaseType')} />
                        </SelectTrigger>
                        <SelectContent>
                          {coveredDiseases.map((d) => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                              {t(d.nameKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('claimForm.claimAmountLabel')}</Label>
                    <Input
                      type="number"
                      placeholder={t('claimForm.enterClaimAmount')}
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Upload Documents */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div
                    className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="font-medium">{t('claimForm.dragDrop')}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('claimForm.fileTypes')}
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-muted p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUploadedFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Generate ZK Proof */}
              {currentStep === 3 && (
                <div className="space-y-4 text-center">
                  {!zkProof ? (
                    <>
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        {isGenerating ? (
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : (
                          <Lock className="h-10 w-10 text-primary" />
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {isGenerating
                          ? statusMessage || t('claimForm.generating')
                          : t('claimForm.generateProofDesc')}
                      </p>
                      <Button
                        onClick={generateProof}
                        disabled={isGenerating}
                        className="gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('claimForm.generating')}
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            {t('claimForm.generateProof')}
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 className="h-10 w-10 text-success" />
                      </div>
                      <p className="font-semibold text-success">
                        {t('claimForm.proofGenerated')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('claimForm.proofReady')}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('claimForm.policy')}</span>
                      <span className="font-medium">{t('common.policyPrefix')}{selectedPolicy?.id.toString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('claimForm.diseaseType')}</span>
                      <span className="font-medium">
                        {getDiseaseById(diseaseType) ? t(getDiseaseById(diseaseType)!.nameKey) : diseaseType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('claimForm.claimAmount')}</span>
                      <span className="font-medium">${claimAmount} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('claimForm.documents')}</span>
                      <span className="font-medium">{uploadedFiles.length} files</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('claimForm.zkProof')}</span>
                      <span className="flex items-center gap-1 font-medium text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        {t('claims.status.verified')}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming}
                    className="w-full gap-2 bg-gradient-primary hover:opacity-90"
                    size="lg"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('claimForm.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t('claimForm.submitClaim')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex justify-between"
      >
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>

        {currentStep < STEPS.length - 1 && (
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
            disabled={!canProceed()}
            className="gap-2"
          >
            {t('common.next')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}
