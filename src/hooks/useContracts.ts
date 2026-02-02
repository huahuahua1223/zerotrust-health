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

  const { data, isLoading, error, refetch } = useReadContract({
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

  return { product, isLoading, error, refetch };
}

// Get multiple products by IDs
export function useProducts(productIds: readonly bigint[] | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const contracts = productIds?.map((id) => ({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getProduct" as const,
    args: [id],
  })) || [];

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!productIds && productIds.length > 0,
    },
  });

  const products: Product[] = data
    ? data
        .filter((result): result is { status: "success"; result: any } => 
          result.status === "success" && result.result !== undefined
        )
        .map((result) => ({
          id: result.result[0],
          name: result.result[1],
          description: result.result[2],
          premium: result.result[3],
          coverageAmount: result.result[4],
          duration: result.result[5],
          insurer: result.result[6],
          isActive: result.result[7],
          poolBalance: result.result[8],
        }))
    : [];

  return { products, isLoading, error, refetch };
}

// Get all active products with details
export function useActiveProductsWithDetails(chainId?: number) {
  const { productIds, isLoading: idsLoading, error: idsError, refetch: refetchIds } = useActiveProducts(chainId);
  const { products, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts(productIds, chainId);

  const refetch = () => {
    refetchIds();
    refetchProducts();
  };

  return {
    products,
    isLoading: idsLoading || productsLoading,
    error: idsError || productsError,
    refetch,
  };
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

  const { data, isLoading, error, refetch } = useReadContract({
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

  return { policy, isLoading, error, refetch };
}

// Get multiple policies by IDs
export function usePolicies(policyIds: readonly bigint[] | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const contracts = policyIds?.map((id) => ({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getPolicy" as const,
    args: [id],
  })) || [];

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!policyIds && policyIds.length > 0,
    },
  });

  const policies: Policy[] = data
    ? data
        .filter((result): result is { status: "success"; result: any } => 
          result.status === "success" && result.result !== undefined
        )
        .map((result) => ({
          id: result.result[0],
          productId: result.result[1],
          holder: result.result[2],
          startTime: result.result[3],
          endTime: result.result[4],
          status: result.result[5],
        }))
    : [];

  return { policies, isLoading, error, refetch };
}

// Get user policies with details
export function useUserPoliciesWithDetails() {
  const { policyIds, isLoading: idsLoading, error: idsError, refetch: refetchIds } = useUserPolicies();
  const { policies, isLoading: policiesLoading, error: policiesError, refetch: refetchPolicies } = usePolicies(policyIds);

  // Get unique product IDs from policies
  const productIds = policies.length > 0 
    ? [...new Set(policies.map(p => p.productId))]
    : [];

  const { products, isLoading: productsLoading, refetch: refetchProducts } = useProducts(productIds);

  const refetch = () => {
    refetchIds();
    refetchPolicies();
    refetchProducts();
  };

  // Combine policy data with product info
  const policiesWithProducts = policies.map(policy => ({
    ...policy,
    product: products.find(p => p.id === policy.productId),
  }));

  return {
    policies: policiesWithProducts,
    isLoading: idsLoading || policiesLoading || productsLoading,
    error: idsError || policiesError,
    refetch,
  };
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

  const { data, isLoading, error, refetch } = useReadContract({
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

  return { claim, isLoading, error, refetch };
}

// Get multiple claims by IDs
export function useClaims(claimIds: readonly bigint[] | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const contracts = claimIds?.map((id) => ({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "getClaim" as const,
    args: [id],
  })) || [];

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!claimIds && claimIds.length > 0,
    },
  });

  const claims: Claim[] = data
    ? data
        .filter((result): result is { status: "success"; result: any } => 
          result.status === "success" && result.result !== undefined
        )
        .map((result) => ({
          id: result.result[0],
          policyId: result.result[1],
          claimant: result.result[2],
          amount: result.result[3],
          diseaseType: result.result[4],
          documentHash: result.result[5],
          status: result.result[6],
          proofVerified: result.result[7],
          submittedAt: result.result[8],
        }))
    : [];

  return { claims, isLoading, error, refetch };
}

// Get user claims with details
export function useUserClaimsWithDetails() {
  const { claimIds, isLoading: idsLoading, error: idsError, refetch: refetchIds } = useUserClaims();
  const { claims, isLoading: claimsLoading, error: claimsError, refetch: refetchClaims } = useClaims(claimIds);

  // Get unique policy IDs from claims
  const policyIds = claims.length > 0
    ? [...new Set(claims.map(c => c.policyId))]
    : [];

  const { policies, isLoading: policiesLoading, refetch: refetchPolicies } = usePolicies(policyIds);

  // Get unique product IDs from policies
  const productIds = policies.length > 0
    ? [...new Set(policies.map(p => p.productId))]
    : [];

  const { products, isLoading: productsLoading, refetch: refetchProducts } = useProducts(productIds);

  const refetch = () => {
    refetchIds();
    refetchClaims();
    refetchPolicies();
    refetchProducts();
  };

  // Combine claim data with policy and product info
  const claimsWithDetails = claims.map(claim => {
    const policy = policies.find(p => p.id === claim.policyId);
    const product = policy ? products.find(p => p.id === policy.productId) : undefined;
    return {
      ...claim,
      policy,
      product,
    };
  });

  return {
    claims: claimsWithDetails,
    isLoading: idsLoading || claimsLoading || policiesLoading || productsLoading,
    error: idsError || claimsError,
    refetch,
  };
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

// Get insurer claims with details
export function useInsurerClaimsWithDetails() {
  const { claimIds, isLoading: idsLoading, error: idsError, refetch: refetchIds } = useInsurerClaims();
  const { claims, isLoading: claimsLoading, error: claimsError, refetch: refetchClaims } = useClaims(claimIds);

  // Get unique policy IDs from claims
  const policyIds = claims.length > 0
    ? [...new Set(claims.map(c => c.policyId))]
    : [];

  const { policies, isLoading: policiesLoading, refetch: refetchPolicies } = usePolicies(policyIds);

  // Get unique product IDs from policies
  const productIds = policies.length > 0
    ? [...new Set(policies.map(p => p.productId))]
    : [];

  const { products, isLoading: productsLoading, refetch: refetchProducts } = useProducts(productIds);

  const refetch = () => {
    refetchIds();
    refetchClaims();
    refetchPolicies();
    refetchProducts();
  };

  // Combine claim data with policy and product info
  const claimsWithDetails = claims.map(claim => {
    const policy = policies.find(p => p.id === claim.policyId);
    const product = policy ? products.find(p => p.id === policy.productId) : undefined;
    return {
      ...claim,
      policy,
      product,
    };
  });

  return {
    claims: claimsWithDetails,
    isLoading: idsLoading || claimsLoading || policiesLoading || productsLoading,
    error: idsError || claimsError,
    refetch,
  };
}
