import { useReadContract, useReadContracts } from "wagmi";
import { useAccount } from "wagmi";
import { INSURANCE_MANAGER_ABI } from "@/config/abis";
import { getContractAddress } from "@/config/contracts";
import type { Product, Policy, Claim } from "@/types";

// Get all active product IDs
export function useActiveProducts(chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: productIds, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getActiveProducts",
  });

  return { productIds, isLoading, error, refetch };
}

// Get single product details
export function useProduct(productId: bigint | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getProduct",
    args: productId !== undefined ? [productId] : undefined,
    query: {
      enabled: productId !== undefined,
    },
  });

  const product: Product | undefined = data
    ? {
        id: data[0],
        name: data[1],
        description: data[2],
        premium: data[3],
        coverageAmount: data[4],
        duration: data[5],
        insurer: data[6],
        isActive: data[7],
        poolBalance: data[8],
      }
    : undefined;

  return { product, isLoading, error };
}

// Get user's policies
export function useUserPolicies() {
  const { address, chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: policyIds, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getUserPolicies",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { policyIds, isLoading, error, refetch };
}

// Get single policy details
export function usePolicy(policyId: bigint | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getPolicy",
    args: policyId !== undefined ? [policyId] : undefined,
    query: {
      enabled: policyId !== undefined,
    },
  });

  const policy: Policy | undefined = data
    ? {
        id: data[0],
        productId: data[1],
        holder: data[2],
        startTime: data[3],
        endTime: data[4],
        status: data[5],
      }
    : undefined;

  return { policy, isLoading, error };
}

// Get user's claims
export function useUserClaims() {
  const { address, chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: claimIds, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getUserClaims",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { claimIds, isLoading, error, refetch };
}

// Get single claim details
export function useClaim(claimId: bigint | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getClaim",
    args: claimId !== undefined ? [claimId] : undefined,
    query: {
      enabled: claimId !== undefined,
    },
  });

  const claim: Claim | undefined = data
    ? {
        id: data[0],
        policyId: data[1],
        claimant: data[2],
        amount: data[3],
        diseaseType: data[4],
        documentHash: data[5],
        status: data[6],
        proofVerified: data[7],
        submittedAt: data[8],
      }
    : undefined;

  return { claim, isLoading, error };
}

// Get insurer's claims
export function useInsurerClaims() {
  const { address, chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: claimIds, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getInsurerClaims",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { claimIds, isLoading, error, refetch };
}
