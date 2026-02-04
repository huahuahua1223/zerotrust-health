/**
 * Contract Write Operations Hooks
 * 合约写入操作的自定义 Hooks
 */

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { ZK_MEDICAL_INSURANCE_ABI } from "@/config/abis";
import { getContractAddress } from "@/config/contracts";
import type { ZKProof } from "@/types";

// ========== 用户操作 ==========

/**
 * 购买保单
 */
export function useBuyPolicy() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyPolicy = async (productId: bigint) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "buyPolicy",
      args: [productId],
    } as any);
  };

  return {
    buyPolicy,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 提交理赔（附带 ZK 证明）
 */
export function useSubmitClaimWithProof() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitClaim = async (
    policyId: bigint,
    amount: bigint,
    dataHash: `0x${string}`,
    nullifier: `0x${string}`,
    proof: ZKProof,
    publicInputs: bigint[]
  ) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    // 确保公开输入有5个元素
    if (publicInputs.length !== 5) {
      throw new Error(`公开输入必须是5个元素，当前为 ${publicInputs.length}`);
    }

    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "submitClaimWithProof",
      args: [
        policyId,
        amount,
        dataHash,
        nullifier,
        proof.a,
        proof.b,
        proof.c,
        publicInputs as [bigint, bigint, bigint, bigint, bigint],
      ],
    } as any);
  };

  return {
    submitClaim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ========== 保险公司操作 ==========

/**
 * 创建保险产品
 */
export function useCreateProduct() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createProduct = async (
    token: `0x${string}`,
    premiumAmount: bigint,
    maxCoverage: bigint,
    coveragePeriodDays: number,
    coveredRoot: `0x${string}`,
    uri: string
  ) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "createProduct",
      args: [
        token,
        premiumAmount,
        maxCoverage,
        coveragePeriodDays,
        coveredRoot,
        uri,
      ],
    } as any);
  };

  return {
    createProduct,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 为产品池注资
 */
export function useFundPool() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const fundPool = async (productId: bigint, amount: bigint) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "fundPool",
      args: [productId, amount],
    } as any);
  };

  return {
    fundPool,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 设置产品激活状态
 */
export function useSetProductActive() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setProductActive = async (productId: bigint, active: boolean) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "setProductActive",
      args: [productId, active],
    } as any);
  };

  return {
    setProductActive,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 更新产品覆盖范围的 Merkle 根
 */
export function useUpdateCoveredRoot() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateCoveredRoot = async (productId: bigint, newRoot: `0x${string}`) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "updateCoveredRoot",
      args: [productId, newRoot],
    } as any);
  };

  return {
    updateCoveredRoot,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 批准理赔
 */
export function useApproveClaim() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approveClaim = async (claimId: bigint) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "approveClaim",
      args: [claimId],
    } as any);
  };

  return {
    approveClaim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 拒绝理赔
 */
export function useRejectClaim() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const rejectClaim = async (claimId: bigint, decisionMemoHash: `0x${string}`) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "rejectClaim",
      args: [claimId, decisionMemoHash],
    } as any);
  };

  return {
    rejectClaim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 支付理赔
 */
export function usePayoutClaim() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const payoutClaim = async (claimId: bigint) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "payoutClaim",
      args: [claimId],
    } as any);
  };

  return {
    payoutClaim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ========== 管理员操作 ==========

/**
 * 授予角色
 */
export function useGrantRole() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const grantRole = async (role: `0x${string}`, account: `0x${string}`) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "grantRole",
      args: [role, account],
    } as any);
  };

  return {
    grantRole,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 撤销角色
 */
export function useRevokeRole() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const revokeRole = async (role: `0x${string}`, account: `0x${string}`) => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "revokeRole",
      args: [role, account],
    } as any);
  };

  return {
    revokeRole,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 暂停合约
 */
export function usePauseContract() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pause = async () => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "pause",
    } as any);
  };

  return {
    pause,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 恢复合约
 */
export function useUnpauseContract() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unpause = async () => {
    const contractAddress = getContractAddress(chainId, "InsuranceManager");
    
    return writeContract({
      address: contractAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "unpause",
    } as any);
  };

  return {
    unpause,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
