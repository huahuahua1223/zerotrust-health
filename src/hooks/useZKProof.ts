/**
 * React Hook for ZK Proof Generation
 * 零知识证明生成相关 Hook
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

/** 生成证明时必须传入产品链上 Merkle 根与覆盖疾病列表，以与创建产品时一致 */
export interface GenerateProofParams {
  policyId: bigint;
  claimAmount: bigint;
  diseaseId: number;
  documentHash: string;
  coveredRoot: `0x${string}` | bigint;
  diseaseIds: number[];
}

// Hook 层负责承接页面输入，补齐钱包绑定的 secret，
// 最终组装出完整的电路输入并交给底层证明生成逻辑。
export function useZKProof(options: UseZKProofOptions = {}): UseZKProofReturn {
  const { address } = useAccount();
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
        
        // 2. 使用调用方传入的产品 coveredRoot 与疾病列表（须与链上产品一致）
        const coveredRoot =
          typeof params.coveredRoot === "bigint"
            ? params.coveredRoot
            : BigInt(params.coveredRoot);
        const diseaseIds = params.diseaseIds;
        if (!diseaseIds.length) {
          throw new Error("产品覆盖疾病列表为空，无法生成证明");
        }
        if (!diseaseIds.includes(params.diseaseId)) {
          throw new Error(
            `所选疾病 ID ${params.diseaseId} 不在该产品覆盖范围内`
          );
        }

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
 * 增强版 Hook：根据 productId 自动读取产品链上信息。
 * 当前主要用于补充 coveredRoot 和产品 URI。
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

  const result = productData as
    | [bigint, `0x${string}`, `0x${string}`, bigint, bigint, bigint, `0x${string}`, boolean, bigint, string]
    | undefined;

  const coveredRoot = result ? result[6] : undefined;
  const productUri = result ? result[9] : undefined;

  return {
    coveredRoot,
    productUri,
    hasProductData: !!productData,
  };
}

/**
 * 便于把证明结果直接整理成合约提交需要的结构。
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
 * 重新导出 secret 相关工具，供其他模块复用。
 */
export { getSecretForAddress, generateSecret, hasStoredSecret } from "@/hooks/useZKSecret";
