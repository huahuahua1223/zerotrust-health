import { useAccount, useReadContract } from "wagmi";
import { INSURANCE_MANAGER_ABI } from "@/config/abis";
import { getContractAddress } from "@/config/contracts";
import type { UserRoles } from "@/types";

export function useUserRoles(): UserRoles & { isLoading: boolean } {
  const { address, chainId } = useAccount();

  const insuranceManagerAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: isAdmin, isLoading: isAdminLoading } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "isAdmin",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: isInsurer, isLoading: isInsurerLoading } = useReadContract({
    address: insuranceManagerAddress,
    abi: INSURANCE_MANAGER_ABI,
    functionName: "isInsurer",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isAdmin: isAdmin ?? false,
    isInsurer: isInsurer ?? false,
    isLoading: isAdminLoading || isInsurerLoading,
  };
}
