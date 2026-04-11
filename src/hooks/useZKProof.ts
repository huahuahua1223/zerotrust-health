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

/**
 * 生成证明时需要由调用方传入的业务参数。
 * 其中 coveredRoot 和 diseaseIds 应与链上产品配置保持一致。
 */
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

        // 当前 Hook 不直接查询保单，而是复用页面层已经拿到的上下文数据。
        // 页面会把 coveredRoot 和疾病列表传进来，这里只负责做一致性检查。
        const coveredRoot =
          typeof params.coveredRoot === "bigint"
            ? params.coveredRoot
            : BigInt(params.coveredRoot);
        const diseaseIds = params.diseaseIds;

        if (!diseaseIds.length) {
          throw new Error("产品承保疾病列表为空，无法生成证明");
        }

        if (!diseaseIds.includes(params.diseaseId)) {
          throw new Error(`所选疾病 ID ${params.diseaseId} 不在该产品承保范围内`);
        }

        // 用户 secret 只保留在本地，
        // 它会参与计算 nullifier，用于保证一笔理赔只能使用一次。
        const userSecret = getSecretForAddress(address);

        // 在这里统一组装电路需要的公开输入和私有输入。
        const input: ClaimProofInput = {
          policyId: params.policyId,
          claimAmount: params.claimAmount,
          documentHash: params.documentHash,
          diseaseId: params.diseaseId,
          userSecret,
          coveredRoot,
          diseaseIds,
        };

        // 真正耗时的证明计算发生在浏览器本地，而不是后端服务器。
        const result = await generateClaimProof(input, handleProgress);

        setProof(result);
        setStatus("success");
        setStatusMessage("证明生成成功");
        options.onSuccess?.(result);

        return result;
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error("证明生成失败");
        setError(nextError);
        setStatus("error");
        setStatusMessage(nextError.message);
        options.onError?.(nextError);
        throw nextError;
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
