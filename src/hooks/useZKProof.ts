/**
 * React Hook for ZK Proof Generation
 * 零知识证明生成的 React Hook
 */

import { useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { getContractAddress } from "@/config/contracts";
import { ZK_MEDICAL_INSURANCE_ABI } from "@/config/abis";
import { getSecretForAddress } from "@/hooks/useZKSecret";
import {
  generateClaimProof,
  type ClaimProofInput,
  type ProofResult,
  type ProofStatus,
} from "@/lib/zk/proof";

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
  diseaseId: number;
  documentHash: string;
}

export function useZKProof(options: UseZKProofOptions = {}): UseZKProofReturn {
  const { address, chainId } = useAccount();
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
      setStatusMessage("初始化证明生成...");

      try {
        if (!address) {
          throw new Error("请先连接钱包");
        }

        // 1. 获取保单信息
        handleProgress("loading", "获取保单信息...");
        // Note: policyData would be fetched here in production
        // const policyData = await fetch(...)

        // 由于合约查询需要使用 useReadContract，这里我们需要传入必要的信息
        // 实际应用中，调用者应该已经有了 policy 信息
        
        // 2. 获取产品信息（包含 coveredRoot 和疾病列表）
        handleProgress("loading", "获取产品信息...");
        
        // 由于无法在 callback 中使用 hooks，我们需要在组件中预先查询
        // 这里假设调用者会传入所需的信息
        // 或者，我们使用默认的测试数据
        
        // 临时方案：使用测试疾病列表
        const diseaseIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
        
        // 默认的 coveredRoot（需要与产品匹配）
        // 实际应该从产品信息中获取
        const coveredRoot = BigInt("0x0"); // 将在实际使用时替换
        
        // 3. 获取用户密钥
        const userSecret = getSecretForAddress(address);
        
        // 4. 构建证明输入
        const input: ClaimProofInput = {
          policyId: params.policyId,
          claimAmount: params.claimAmount,
          documentHash: params.documentHash,
          diseaseId: params.diseaseId,
          userSecret,
          coveredRoot,
          diseaseIds,
        };

        // 5. 生成证明
        const result = await generateClaimProof(input, handleProgress);

        setProof(result);
        setStatus("success");
        setStatusMessage("证明生成成功！");
        options.onSuccess?.(result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("证明生成失败");
        setError(error);
        setStatus("error");
        setStatusMessage(error.message);
        options.onError?.(error);
        throw error;
      }
    },
    [address, chainId, handleProgress, options]
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
 * 增强版 ZK Proof Hook - 自动查询产品信息
 */
export function useZKProofWithProduct(productId: bigint | undefined) {
  const { chainId } = useAccount();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  // 查询产品信息（包含 coveredRoot）
  const { data: productData } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "products",
    args: productId !== undefined ? [productId] : undefined,
    query: {
      enabled: productId !== undefined,
    },
  });

  const result = productData as [bigint, `0x${string}`, `0x${string}`, bigint, bigint, bigint, `0x${string}`, boolean, bigint, string] | undefined;
  const coveredRoot = result ? result[6] : undefined; // coveredRoot 是第7个字段
  const productUri = result ? result[9] : undefined; // uri 是第10个字段

  return {
    coveredRoot,
    productUri,
    hasProductData: !!productData,
  };
}

/**
 * Helper hook to format proof for contract submission
 */
export function useFormatProofForContract() {
  return useCallback((result: ProofResult) => {
    return {
      proof: result.proof,
      publicInputs: result.publicInputs,
      dataHash: result.dataHash,
      nullifier: result.nullifier,
    };
  }, []);
}

/**
 * 从用户地址获取或创建密钥
 * 重新导出以便外部使用
 */
export { getSecretForAddress, generateSecret, hasStoredSecret } from "@/hooks/useZKSecret";
