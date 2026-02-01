import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/locales";
import { useToast } from "@/hooks/use-toast";
import { useClaimFormStore, useUIStore } from "@/store";
import { DiseaseTypes, PolicyStatus } from "@/types";

// Mock active policies
const mockActivePolicies = [
  {
    id: 1n,
    productName: "Basic Health Plan",
    coverageAmount: 10000_000000n,
    endTime: BigInt(Math.floor(Date.now() / 1000) + 335 * 24 * 60 * 60),
  },
  {
    id: 2n,
    productName: "Premium Health Plan",
    coverageAmount: 100000_000000n,
    endTime: BigInt(Math.floor(Date.now() / 1000) + 305 * 24 * 60 * 60),
  },
];

const STEPS = [
  { icon: Shield, key: "selectPolicy" },
  { icon: FileText, key: "claimDetails" },
  { icon: Upload, key: "uploadDocuments" },
  { icon: Lock, key: "generateProof" },
  { icon: Send, key: "review" },
] as const;

export default function SubmitClaim() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { t } = useI18n();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setZKProof,
    reset,
  } = useClaimFormStore();

  const selectedPolicy = mockActivePolicies.find(
    (p) => p.id === selectedPolicyId
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => addUploadedFile(file));
    }
  };

  const generateProof = async () => {
    setIsGeneratingProof(true);
    // Simulate ZK proof generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setZKProof(
      {
        a: ["0x1234", "0x5678"],
        b: [
          ["0x1111", "0x2222"],
          ["0x3333", "0x4444"],
        ],
        c: ["0x5555", "0x6666"],
      },
      ["1", "2", "3"]
    );
    setIsGeneratingProof(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Claim Submitted!",
      description: "Your claim has been submitted successfully with ZK proof verification.",
    });
    reset();
    navigate("/my-claims");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedPolicyId !== null;
      case 1:
        return diseaseType > 0 && claimAmount && parseFloat(claimAmount) > 0;
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
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
          <p className="text-muted-foreground">Connect your wallet to submit a claim.</p>
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
        <h1 className="mb-2 font-display text-3xl font-bold">{t.claimForm.title}</h1>
        <p className="text-muted-foreground">
          Complete the steps below to submit your insurance claim with privacy protection.
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
                    {t.claimForm.steps[step.key as keyof typeof t.claimForm.steps]}
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
                {t.claimForm.steps[STEPS[currentStep].key as keyof typeof t.claimForm.steps]}
              </CardTitle>
              <CardDescription>
                {currentStep === 0 && t.claimForm.selectPolicyDesc}
                {currentStep === 1 && t.claimForm.claimDetailsDesc}
                {currentStep === 2 && t.claimForm.uploadDocumentsDesc}
                {currentStep === 3 && t.claimForm.generateProofDesc}
                {currentStep === 4 && t.claimForm.reviewDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Select Policy */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  {mockActivePolicies.map((policy) => (
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
                          <h4 className="font-semibold">{policy.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Policy #{policy.id.toString()} • Coverage: $
                            {(Number(policy.coverageAmount) / 1000000).toLocaleString()}
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
                  ))}
                </div>
              )}

              {/* Step 2: Claim Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.claimForm.diseaseType}</Label>
                    <Select
                      value={diseaseType.toString()}
                      onValueChange={(v) => setDiseaseType(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select disease type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DiseaseTypes).map(([id, name]) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.claimForm.claimAmount} (USDT)</Label>
                    <Input
                      type="number"
                      placeholder="Enter claim amount"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                    />
                    {selectedPolicy && (
                      <p className="text-xs text-muted-foreground">
                        Maximum coverage: $
                        {(Number(selectedPolicy.coverageAmount) / 1000000).toLocaleString()}
                      </p>
                    )}
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
                    <p className="font-medium">{t.claimForm.dragDrop}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      PDF, JPG, PNG up to 10MB
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
                        {isGeneratingProof ? (
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : (
                          <Lock className="h-10 w-10 text-primary" />
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {isGeneratingProof
                          ? t.claimForm.generating
                          : "Click the button below to generate your zero-knowledge proof."}
                      </p>
                      <Button
                        onClick={generateProof}
                        disabled={isGeneratingProof}
                        className="gap-2"
                      >
                        {isGeneratingProof ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Generate ZK Proof
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
                        {t.claimForm.proofGenerated}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your proof has been generated and is ready for submission.
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
                      <span className="text-muted-foreground">Policy</span>
                      <span className="font-medium">{selectedPolicy?.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Disease Type</span>
                      <span className="font-medium">
                        {DiseaseTypes[diseaseType as keyof typeof DiseaseTypes]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Claim Amount</span>
                      <span className="font-medium">${claimAmount} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documents</span>
                      <span className="font-medium">{uploadedFiles.length} files</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ZK Proof</span>
                      <span className="flex items-center gap-1 font-medium text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full gap-2 bg-gradient-primary hover:opacity-90"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t.claimForm.submitClaim}
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
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </Button>

        {currentStep < STEPS.length - 1 && (
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed()}
            className="gap-2"
          >
            {t.common.next}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
