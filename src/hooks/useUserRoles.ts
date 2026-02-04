/**
 * User Roles Hook
 * 用户角色检查 Hook
 * 
 * 检查用户在智能合约中的角色权限
 */

import { useAccount, useReadContract } from "wagmi";
import { getContractAddress } from "@/config/contracts";
import { ZK_MEDICAL_INSURANCE_ABI } from "@/config/abis";

export interface UserRoles {
  isAdmin: boolean;
  isInsurer: boolean;
  isHospital: boolean;
  isPauser: boolean;
  isLoading: boolean;
}

/**
 * 获取用户在合约中的所有角色
 */
export function useUserRoles(): UserRoles {
  const { address, chainId } = useAccount();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  // 获取角色常量
  const { data: adminRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: insurerRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "INSURER_ROLE",
  });

  const { data: hospitalRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "HOSPITAL_ROLE",
  });

  const { data: pauserRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "PAUSER_ROLE",
  });

  // 检查用户是否拥有各个角色
  const { data: isAdmin, isLoading: isLoadingAdmin } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "hasRole",
    args: adminRole && address ? [adminRole, address] : undefined,
    query: {
      enabled: !!adminRole && !!address,
    },
  });

  const { data: isInsurer, isLoading: isLoadingInsurer } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "hasRole",
    args: insurerRole && address ? [insurerRole, address] : undefined,
    query: {
      enabled: !!insurerRole && !!address,
    },
  });

  const { data: isHospital, isLoading: isLoadingHospital } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "hasRole",
    args: hospitalRole && address ? [hospitalRole, address] : undefined,
    query: {
      enabled: !!hospitalRole && !!address,
    },
  });

  const { data: isPauser, isLoading: isLoadingPauser } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "hasRole",
    args: pauserRole && address ? [pauserRole, address] : undefined,
    query: {
      enabled: !!pauserRole && !!address,
    },
  });

  const isLoading =
    isLoadingAdmin || isLoadingInsurer || isLoadingHospital || isLoadingPauser;

  return {
    isAdmin: !!isAdmin,
    isInsurer: !!isInsurer,
    isHospital: !!isHospital,
    isPauser: !!isPauser,
    isLoading,
  };
}

/**
 * 只检查是否为保险公司
 */
export function useIsInsurer(): { isInsurer: boolean; isLoading: boolean } {
  const { address, chainId } = useAccount();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: insurerRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "INSURER_ROLE",
  });

  const { data: isInsurer, isLoading } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "hasRole",
    args: insurerRole && address ? [insurerRole, address] : undefined,
    query: {
      enabled: !!insurerRole && !!address,
    },
  });

  return {
    isInsurer: !!isInsurer,
    isLoading,
  };
}

/**
 * 只检查是否为管理员
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const { address, chainId } = useAccount();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: adminRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: isAdmin, isLoading } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "hasRole",
    args: adminRole && address ? [adminRole, address] : undefined,
    query: {
      enabled: !!adminRole && !!address,
    },
  });

  return {
    isAdmin: !!isAdmin,
    isLoading,
  };
}

/**
 * 获取角色常量
 */
export function useRoleConstants() {
  const { chainId } = useAccount();
  const contractAddress = getContractAddress(chainId, "InsuranceManager");

  const { data: adminRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: insurerRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "INSURER_ROLE",
  });

  const { data: hospitalRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "HOSPITAL_ROLE",
  });

  const { data: pauserRole } = useReadContract({
    address: contractAddress,
    abi: ZK_MEDICAL_INSURANCE_ABI,
    functionName: "PAUSER_ROLE",
  });

  return {
    DEFAULT_ADMIN_ROLE: adminRole,
    INSURER_ROLE: insurerRole,
    HOSPITAL_ROLE: hospitalRole,
    PAUSER_ROLE: pauserRole,
  };
}
