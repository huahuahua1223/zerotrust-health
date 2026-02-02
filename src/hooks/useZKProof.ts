/**
 * React Hook for ZK Proof Generation
 */

import { useState, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  generateClaimProof,
  getSecretForAddress,
  hashToField,
  type ClaimProofInput,
  type ProofResult,
  type ProofStatus,
} from "@/lib/zk";

interface UseZKProofOptions {
  onSuccess?: (result: ProofResult) => void;
  onError?: (error: Error) => void;
}

interface UseZKProofReturn {
  generateProof: (params: GenerateProofParams) => Promise<ProofResult>;
  proof: ProofResult | null;
  status: ProofStatus;
  statusMessage: string;
  error: Error | null;
  isGenerating: boolean;
  reset: () => void;
}

interface GenerateProofParams {
  policyId: bigint;
  claimAmount: bigint;
  diseaseType: number;
  documentHash: string;
  medicalRecordHash?: string;
  patientId?: string;
  diagnosisCode?: string;
  treatmentDate?: number;
}

export function useZKProof(options: UseZKProofOptions = {}): UseZKProofReturn {
  const { address } = useAppKitAccount();
  const [proof, setProof] = useState<ProofResult | null>(null);
  const [status, setStatus] = useState<ProofStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const handleProgress = useCallback((newStatus: ProofStatus, message: string) => {
    setStatus(newStatus);
    setStatusMessage(message);
  }, []);

  const generateProof = useCallback(
    async (params: GenerateProofParams): Promise<ProofResult> => {
      setError(null);
      setProof(null);
      setStatus("loading");
      setStatusMessage("Initializing proof generation...");

      try {
        // Get user secret for this wallet
        const userSecret = address
          ? getSecretForAddress(address)
          : getSecretForAddress("default");

        // Build proof input
        const input: ClaimProofInput = {
          // Private inputs
          medicalRecordHash: params.medicalRecordHash || params.documentHash,
          patientId: params.patientId || address || "anonymous",
          diagnosisCode: params.diagnosisCode || `DIAG_${params.diseaseType}`,
          treatmentDate: params.treatmentDate || Math.floor(Date.now() / 1000),
          userSecret,

          // Public inputs
          diseaseType: params.diseaseType,
          claimAmount: params.claimAmount,
          policyId: params.policyId,
          documentHash: params.documentHash,
        };

        const result = await generateClaimProof(input, handleProgress);

        setProof(result);
        setStatus("success");
        setStatusMessage("Proof generated successfully!");
        options.onSuccess?.(result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Proof generation failed");
        setError(error);
        setStatus("error");
        setStatusMessage(error.message);
        options.onError?.(error);
        throw error;
      }
    },
    [address, handleProgress, options]
  );

  const reset = useCallback(() => {
    setProof(null);
    setStatus("idle");
    setStatusMessage("");
    setError(null);
  }, []);

  return {
    generateProof,
    proof,
    status,
    statusMessage,
    error,
    isGenerating: status === "loading" || status === "generating",
    reset,
  };
}

/**
 * Helper hook to format proof for contract submission
 */
export function useFormatProofForContract() {
  return useCallback((result: ProofResult) => {
    return {
      proof: {
        a: result.proof.a.map(v => v.toString()) as [string, string],
        b: result.proof.b.map(row => 
          row.map(v => v.toString())
        ) as [[string, string], [string, string]],
        c: result.proof.c.map(v => v.toString()) as [string, string],
      },
      publicInputs: result.publicInputs.map(v => v.toString()),
    };
  }, []);
}
