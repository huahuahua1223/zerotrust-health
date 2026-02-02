import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { INSURANCE_MANAGER_ABI } from "@/config/abis";
import { getContractAddress } from "@/config/contracts";
import type { ZKProof } from "@/types";

// ===== User Operations =====

export function useBuyPolicy() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyPolicy = (productId: bigint) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "buyPolicy",
      args: [productId],
    });
  };

  return { buyPolicy, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useSubmitClaimWithProof() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitClaim = (
    policyId: bigint,
    amount: bigint,
    diseaseType: bigint,
    documentHash: `0x${string}`,
    proof: ZKProof,
    publicInputs: bigint[]
  ) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "submitClaimWithProof",
      args: [policyId, amount, diseaseType, documentHash, proof, publicInputs],
    });
  };

  return { submitClaim, hash, isPending, isConfirming, isSuccess, error, reset };
}

// ===== Insurer Operations =====

export function useCreateProduct() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createProduct = (
    name: string,
    description: string,
    premium: bigint,
    coverageAmount: bigint,
    duration: bigint
  ) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "createProduct",
      args: [name, description, premium, coverageAmount, duration],
    });
  };

  return { createProduct, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useFundPool() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const fundPool = (productId: bigint, amount: bigint) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "fundPool",
      args: [productId, amount],
    });
  };

  return { fundPool, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useSetProductActive() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setProductActive = (productId: bigint, isActive: boolean) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "setProductActive",
      args: [productId, isActive],
    });
  };

  return { setProductActive, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useApproveClaim() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approveClaim = (claimId: bigint) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "approveClaim",
      args: [claimId],
    });
  };

  return { approveClaim, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useRejectClaim() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const rejectClaim = (claimId: bigint) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "rejectClaim",
      args: [claimId],
    });
  };

  return { rejectClaim, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function usePayClaim() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const payClaim = (claimId: bigint) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "payClaim",
      args: [claimId],
    });
  };

  return { payClaim, hash, isPending, isConfirming, isSuccess, error, reset };
}

// ===== Admin Operations =====

export function useGrantInsurerRole() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const grantInsurerRole = (account: `0x${string}`) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "grantInsurerRole",
      args: [account],
    });
  };

  return { grantInsurerRole, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useRevokeInsurerRole() {
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const revokeInsurerRole = (account: `0x${string}`) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: insuranceManagerAddress,
      abi: INSURANCE_MANAGER_ABI,
      functionName: "revokeInsurerRole",
      args: [account],
    });
  };

  return { revokeInsurerRole, hash, isPending, isConfirming, isSuccess, error, reset };
}
