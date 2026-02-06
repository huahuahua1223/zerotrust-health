import { useReadContract, useReadContracts } from "wagmi";
import { useAccount } from "wagmi";
import { ZK_MEDICAL_INSURANCE_ABI } from "@/config/abis";
import { getContractAddress } from "@/config/contracts";
import type { Product, Policy, PolicyWithProduct, Claim, ClaimWithDetails } from "@/types";

// ========== Product Hooks ==========

// Get products with pagination (using brief data, then fetch full details)
export function useProducts(cursor = 0n, size = 20n, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  // First, get brief product list
  const { data: briefData, isLoading: isBriefLoading, error: briefError, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "getProductsBriefPage",
    args: [cursor, size],
  });

  const briefResult = briefData as [any[], bigint] | undefined;
  const productIds = briefResult?.[0]?.map((item: any) => item.id) || [];

  // Then, fetch full details for each product
  const { data: fullData, isLoading: isFullLoading } = useReadContracts({
    contracts: productIds.map((id: bigint) => ({
      address: insuranceManagerAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "products",
      args: [id],
    })),
    query: {
      enabled: productIds.length > 0,
    },
  });

  // Also fetch pool balances for each product
  const { data: poolData, isLoading: isPoolLoading } = useReadContracts({
    contracts: productIds.map((id: bigint) => ({
      address: insuranceManagerAddress,
      abi: ZK_MEDICAL_INSURANCE_ABI,
      functionName: "productPool",
      args: [id],
    })),
    query: {
      enabled: productIds.length > 0,
    },
  });

  const mappedProducts = fullData?.map((item, index) => {
    if (item?.status === 'success' && item.result) {
      const result = item.result as [bigint, `0x${string}`, `0x${string}`, bigint, bigint, bigint, `0x${string}`, boolean, bigint, string];
      
      // Get pool balance for this product
      const poolBalance = poolData?.[index]?.status === 'success' 
        ? (poolData[index].result as bigint)
        : 0n;
      
      const product = {
        id: result[0],
        insurer: result[1],
        token: result[2],
        premiumAmount: result[3],
        maxCoverage: result[4],
        coveragePeriodDays: Number(result[5]),
        coveredRoot: result[6],
        active: result[7],
        createdAt: result[8],
        uri: result[9],
        poolBalance, // 添加资金池余额
      };
      
      return product;
    }
    
    // Fallback to brief data if full data fetch failed
    const brief = briefResult?.[0]?.[index];
    if (!brief) {
      return null;
    }
    
    return {
      id: brief.id,
      insurer: brief.insurer,
      token: brief.token,
      premiumAmount: brief.premiumAmount,
      maxCoverage: brief.maxCoverage,
      coveragePeriodDays: Number(brief.coveragePeriodDays),
      coveredRoot: brief.coveredRoot,
      active: brief.active,
      createdAt: 0n,
      uri: "",
    };
  });
  
  const products: Product[] = (mappedProducts?.filter(Boolean) as Product[]) || [];

  return { 
    products, 
    nextCursor: briefResult?.[1] || cursor,
    hasMore: briefResult?.[1] !== cursor,
    isLoading: isBriefLoading || isFullLoading || isPoolLoading, 
    error: briefError, 
    refetch 
  };
}

// Get single product details
export function useProduct(productId: bigint | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "products",
    args: productId !== undefined ? [productId] : undefined,
    query: {
      enabled: productId !== undefined,
    },
  });

  const result = data as [bigint, `0x${string}`, `0x${string}`, bigint, bigint, bigint, `0x${string}`, boolean, bigint, string] | undefined;
  const product: Product | undefined = result
    ? {
        id: result[0],
        insurer: result[1],
        token: result[2],
        premiumAmount: result[3],
        maxCoverage: result[4],
        coveragePeriodDays: Number(result[5]),
        coveredRoot: result[6],
        active: result[7],
        createdAt: result[8],
        uri: result[9],
      }
    : undefined;

  return { product, isLoading, error, refetch };
}

// Get product pool balance
export function useProductPool(productId: bigint | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "productPool",
    args: productId !== undefined ? [productId] : undefined,
    query: {
      enabled: productId !== undefined,
    },
  });

  return { poolBalance: (data as bigint) || 0n, isLoading, error, refetch };
}

// Get products count
export function useProductsCount(chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "productsCount",
  });

  return { count: data || 0n, isLoading };
}

// ========== Policy Hooks ==========

// Get user's policy IDs with pagination
export function useUserPolicyIds(chainId?: number) {
  const { address } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "getUserPolicyIdsPage",
    args: address ? [address, 0n, 50n] : undefined, // 查询前50个保单
    query: {
      enabled: !!address,
    },
  });

  const result = data as [bigint[], bigint] | undefined;
  return { 
    policyIds: result?.[0] || [], 
    nextCursor: result?.[1],
    isLoading, 
    error, 
    refetch 
  };
}

// Get single policy details
export function usePolicy(policyId: bigint | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "policies",
    args: policyId !== undefined ? [policyId] : undefined,
    query: {
      enabled: policyId !== undefined,
    },
  });

  const result = data as [bigint, bigint, `0x${string}`, bigint, bigint, number, bigint] | undefined;
  const policy: Policy | undefined = result
    ? {
        id: result[0],
        productId: result[1],
        holder: result[2],
        startAt: result[3],
        endAt: result[4],
        status: result[5],
        createdAt: result[6],
      }
    : undefined;

  return { policy, isLoading, error, refetch };
}

// Get multiple policies by IDs
export function usePolicies(policyIds: readonly bigint[] | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const contracts = policyIds?.map((id) => ({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "policies" as const,
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
          startAt: result.result[3],
          endAt: result.result[4],
          status: result.result[5],
          createdAt: result.result[6],
        }))
    : [];

  return { policies, isLoading, error, refetch };
}

// Get user policies with product details
export function useUserPoliciesWithDetails(): {
  policies: PolicyWithProduct[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { policyIds, isLoading: idsLoading, error: idsError, refetch: refetchIds } = useUserPolicyIds();
  const { policies, isLoading: policiesLoading, error: policiesError, refetch: refetchPolicies } = usePolicies(policyIds);

  // Get unique product IDs from policies
  const productIds = policies.length > 0 
    ? [...new Set(policies.map(p => p.productId))]
    : [];

  // Batch query products
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  
  const productContracts = productIds.map((id) => ({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "products" as const,
    args: [id],
  }));

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useReadContracts({
    contracts: productContracts,
    query: {
      enabled: productIds.length > 0,
    },
  });

  const products: Product[] = productsData
    ? productsData
        .filter((result): result is { status: "success"; result: any } => 
          result.status === "success" && result.result !== undefined
        )
        .map((result) => ({
          id: result.result[0],
          insurer: result.result[1],
          token: result.result[2],
          premiumAmount: result.result[3],
          maxCoverage: result.result[4],
          coveragePeriodDays: Number(result.result[5]),
          coveredRoot: result.result[6],
          active: result.result[7],
          createdAt: result.result[8],
          uri: result.result[9],
        }))
    : [];

  const refetch = () => {
    refetchIds();
    refetchPolicies();
    refetchProducts();
  };

  // Combine policy data with product info
  const policiesWithProducts: PolicyWithProduct[] = policies.map(policy => ({
    ...policy,
    product: products.find(p => p.id === policy.productId),
  }));

  return {
    policies: policiesWithProducts,
    isLoading: idsLoading || policiesLoading || productsLoading,
    error: idsError || policiesError || null,
    refetch,
  };
}

// ========== Claim Hooks ==========

// Get user's claim IDs with pagination
export function useUserClaimIds(chainId?: number) {
  const { address } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "getUserClaimIdsPage",
    args: address ? [address, 0n, 50n] : undefined, // 查询前50个理赔
    query: {
      enabled: !!address,
    },
  });

  const result = data as [bigint[], bigint] | undefined;
  return { 
    claimIds: result?.[0] || [], 
    nextCursor: result?.[1],
    isLoading, 
    error, 
    refetch 
  };
}

// Get single claim details
export function useClaim(claimId: bigint | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "claims",
    args: claimId !== undefined ? [claimId] : undefined,
    query: {
      enabled: claimId !== undefined,
    },
  });

  const result = data as [bigint, bigint, `0x${string}`, bigint, `0x${string}`, `0x${string}`, `0x${string}`, number, bigint, bigint, bigint, `0x${string}`] | undefined;
  const claim: Claim | undefined = result
    ? {
        id: result[0],
        policyId: result[1],
        claimant: result[2],
        amount: result[3],
        dataHash: result[4],
        nullifier: result[5],
        publicSignalsHash: result[6],
        status: result[7],
        submittedAt: result[8],
        decidedAt: result[9],
        paidAt: result[10],
        decisionMemoHash: result[11],
      }
    : undefined;

  return { claim, isLoading, error, refetch };
}

// Get multiple claims by IDs
export function useClaims(claimIds: readonly bigint[] | undefined, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const contracts = claimIds?.map((id) => ({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "claims" as const,
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
          dataHash: result.result[4],
          nullifier: result.result[5],
          publicSignalsHash: result.result[6],
          status: result.result[7],
          submittedAt: result.result[8],
          decidedAt: result.result[9],
          paidAt: result.result[10],
          decisionMemoHash: result.result[11],
        }))
    : [];

  return { claims, isLoading, error, refetch };
}

// Get user claims with full details (policy + product)
export function useUserClaimsWithDetails(): {
  claims: ClaimWithDetails[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { claimIds, isLoading: idsLoading, error: idsError, refetch: refetchIds } = useUserClaimIds();
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

  // Batch query products
  const { chainId } = useAccount();
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");
  
  const productContracts = productIds.map((id) => ({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "products" as const,
    args: [id],
  }));

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useReadContracts({
    contracts: productContracts,
    query: {
      enabled: productIds.length > 0,
    },
  });

  const products: Product[] = productsData
    ? productsData
        .filter((result): result is { status: "success"; result: any } => 
          result.status === "success" && result.result !== undefined
        )
        .map((result) => ({
          id: result.result[0],
          insurer: result.result[1],
          token: result.result[2],
          premiumAmount: result.result[3],
          maxCoverage: result.result[4],
          coveragePeriodDays: Number(result.result[5]),
          coveredRoot: result.result[6],
          active: result.result[7],
          createdAt: result.result[8],
          uri: result.result[9],
        }))
    : [];

  const refetch = () => {
    refetchIds();
    refetchClaims();
    refetchPolicies();
    refetchProducts();
  };

  // Combine claim data with policy and product info
  const claimsWithDetails: ClaimWithDetails[] = claims.map(claim => {
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
    error: idsError || claimsError || null,
    refetch,
  };
}

// Get all claims by page (for insurer dashboard)
export function useClaimsByPage(cursor = 0n, size = 20n, chainId?: number) {
  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data, isLoading, error, refetch } = useReadContract({
    address: insuranceManagerAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "getClaimsBriefPage",
    args: [cursor, size],
  });

  const result = data as [any[], bigint] | undefined;
  const claims: Claim[] = result?.[0]?.map((item: any) => ({
    id: item.id,
    policyId: item.policyId,
    claimant: item.claimant,
    amount: item.amount,
    dataHash: item.dataHash,
    nullifier: item.nullifier,
    publicSignalsHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`, // Brief中不包含
    status: item.status,
    submittedAt: 0n, // Brief中不包含
    decidedAt: 0n,
    paidAt: 0n,
    decisionMemoHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
  })) || [];

  return { 
    claims, 
    nextCursor: result?.[1] || cursor,
    hasMore: result?.[1] !== cursor,
    isLoading, 
    error, 
    refetch 
  };
}
