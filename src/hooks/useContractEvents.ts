/**
 * Contract Event Listeners Hook
 * Real-time updates when blockchain events occur
 */

import { useQueryClient } from "@tanstack/react-query";
import { useWatchContractEvent, useChainId } from "wagmi";
import { getContractAddress } from "@/config/contracts";
import { INSURANCE_MANAGER_ABI } from "@/config/abis";

/**
 * Watch for PolicyPurchased events and invalidate relevant queries
 */
export function usePolicyPurchasedEvent(userAddress?: `0x${string}`) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  useWatchContractEvent({
    address: contractAddress,
    abi: INSURANCE_MANAGER_ABI,
    eventName: "PolicyPurchased",
    onLogs: (logs) => {
      console.log("PolicyPurchased event:", logs);
      
      // Invalidate user policies query
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ["userPolicies", userAddress] });
        queryClient.invalidateQueries({ queryKey: ["userPoliciesWithDetails", userAddress] });
      }
      
      // Invalidate products to update pool balances
      queryClient.invalidateQueries({ queryKey: ["activeProducts"] });
      queryClient.invalidateQueries({ queryKey: ["activeProductsWithDetails"] });
    },
    enabled: !!contractAddress,
  });
}

/**
 * Watch for ClaimSubmitted events
 */
export function useClaimSubmittedEvent(userAddress?: `0x${string}`) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  useWatchContractEvent({
    address: contractAddress,
    abi: INSURANCE_MANAGER_ABI,
    eventName: "ClaimSubmitted",
    onLogs: (logs) => {
      console.log("ClaimSubmitted event:", logs);
      
      // Invalidate user claims
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ["userClaims", userAddress] });
        queryClient.invalidateQueries({ queryKey: ["userClaimsWithDetails", userAddress] });
      }
      
      // Invalidate insurer claims (for all insurers)
      queryClient.invalidateQueries({ queryKey: ["insurerClaims"] });
      queryClient.invalidateQueries({ queryKey: ["insurerClaimsWithDetails"] });
    },
    enabled: !!contractAddress,
  });
}

/**
 * Watch for ClaimApproved events
 */
export function useClaimApprovedEvent(userAddress?: `0x${string}`) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  useWatchContractEvent({
    address: contractAddress,
    abi: INSURANCE_MANAGER_ABI,
    eventName: "ClaimApproved",
    onLogs: (logs) => {
      console.log("ClaimApproved event:", logs);
      
      // Invalidate all claim-related queries
      queryClient.invalidateQueries({ queryKey: ["claim"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ["userClaims", userAddress] });
        queryClient.invalidateQueries({ queryKey: ["userClaimsWithDetails", userAddress] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["insurerClaims"] });
      queryClient.invalidateQueries({ queryKey: ["insurerClaimsWithDetails"] });
    },
    enabled: !!contractAddress,
  });
}

/**
 * Watch for ClaimRejected events
 */
export function useClaimRejectedEvent(userAddress?: `0x${string}`) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  useWatchContractEvent({
    address: contractAddress,
    abi: INSURANCE_MANAGER_ABI,
    eventName: "ClaimRejected",
    onLogs: (logs) => {
      console.log("ClaimRejected event:", logs);
      
      // Invalidate all claim-related queries
      queryClient.invalidateQueries({ queryKey: ["claim"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ["userClaims", userAddress] });
        queryClient.invalidateQueries({ queryKey: ["userClaimsWithDetails", userAddress] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["insurerClaims"] });
      queryClient.invalidateQueries({ queryKey: ["insurerClaimsWithDetails"] });
    },
    enabled: !!contractAddress,
  });
}

/**
 * Watch for ClaimPaid events
 */
export function useClaimPaidEvent(userAddress?: `0x${string}`) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  useWatchContractEvent({
    address: contractAddress,
    abi: INSURANCE_MANAGER_ABI,
    eventName: "ClaimPaid",
    onLogs: (logs) => {
      console.log("ClaimPaid event:", logs);
      
      // Invalidate all claim-related queries
      queryClient.invalidateQueries({ queryKey: ["claim"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ["userClaims", userAddress] });
        queryClient.invalidateQueries({ queryKey: ["userClaimsWithDetails", userAddress] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["insurerClaims"] });
      queryClient.invalidateQueries({ queryKey: ["insurerClaimsWithDetails"] });
      
      // Also invalidate product pool balances (减少了)
      queryClient.invalidateQueries({ queryKey: ["productPool"] });
    },
    enabled: !!contractAddress,
  });
}

/**
 * Watch for ProductCreated events
 */
export function useProductCreatedEvent() {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  useWatchContractEvent({
    address: contractAddress,
    abi: INSURANCE_MANAGER_ABI,
    eventName: "ProductCreated",
    onLogs: (logs) => {
      console.log("ProductCreated event:", logs);
      
      // Invalidate product queries
      queryClient.invalidateQueries({ queryKey: ["activeProducts"] });
      queryClient.invalidateQueries({ queryKey: ["activeProductsWithDetails"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    enabled: !!contractAddress,
  });
}

/**
 * Combined hook to watch all relevant events for a user
 */
export function useContractEvents(userAddress?: `0x${string}`) {
  usePolicyPurchasedEvent(userAddress);
  useClaimSubmittedEvent(userAddress);
  useClaimApprovedEvent(userAddress);
  useClaimRejectedEvent(userAddress);
  useClaimPaidEvent(userAddress);
  useProductCreatedEvent();
}

/**
 * Hook for insurer-specific events
 */
export function useInsurerEvents(insurerAddress?: `0x${string}`) {
  useClaimSubmittedEvent(insurerAddress);
  useClaimApprovedEvent(insurerAddress);
  useClaimRejectedEvent(insurerAddress);
  useClaimPaidEvent(insurerAddress);
  useProductCreatedEvent();
}

/**
 * Manual refresh function for when events aren't working
 */
export function useManualRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["activeProducts"] });
    queryClient.invalidateQueries({ queryKey: ["activeProductsWithDetails"] });
    queryClient.invalidateQueries({ queryKey: ["userPolicies"] });
    queryClient.invalidateQueries({ queryKey: ["userPoliciesWithDetails"] });
    queryClient.invalidateQueries({ queryKey: ["userClaims"] });
    queryClient.invalidateQueries({ queryKey: ["userClaimsWithDetails"] });
    queryClient.invalidateQueries({ queryKey: ["insurerClaims"] });
    queryClient.invalidateQueries({ queryKey: ["insurerClaimsWithDetails"] });
  };

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["activeProducts"] });
    queryClient.invalidateQueries({ queryKey: ["activeProductsWithDetails"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const refreshPolicies = () => {
    queryClient.invalidateQueries({ queryKey: ["userPolicies"] });
    queryClient.invalidateQueries({ queryKey: ["userPoliciesWithDetails"] });
    queryClient.invalidateQueries({ queryKey: ["policy"] });
    queryClient.invalidateQueries({ queryKey: ["policies"] });
  };

  const refreshClaims = () => {
    queryClient.invalidateQueries({ queryKey: ["userClaims"] });
    queryClient.invalidateQueries({ queryKey: ["userClaimsWithDetails"] });
    queryClient.invalidateQueries({ queryKey: ["insurerClaims"] });
    queryClient.invalidateQueries({ queryKey: ["insurerClaimsWithDetails"] });
    queryClient.invalidateQueries({ queryKey: ["claim"] });
    queryClient.invalidateQueries({ queryKey: ["claims"] });
  };

  return {
    refreshAll,
    refreshProducts,
    refreshPolicies,
    refreshClaims,
  };
}
