/**
 * Contract ABIs
 * 合约 ABI 定义
 * 
 * 说明：
 * 1. ZKMedicalInsurance ABI 直接从 Hardhat artifacts 导入
 * 2. ERC20 ABI 使用 viem 内置的 erc20Abi
 * 
 * 更新方法：
 * 1. 在 Hardhat 项目中编译: pnpm build:contracts
 * 2. 手动复制 ZKMedicalInsurance.json 到 src/contracts/
 */

import { erc20Abi, type Abi } from 'viem';
import ZKMedicalInsuranceArtifact from '@/contracts/ZKMedicalInsurance.json';

// ZK Medical Insurance Contract ABI (直接从 Hardhat artifacts 导入)
// 注意：需要显式类型断言为 Abi 以满足 Wagmi 的类型要求
export const ZK_MEDICAL_INSURANCE_ABI = ZKMedicalInsuranceArtifact.abi as Abi;

// ERC20 Token ABI (使用 viem 内置)
export const MOCK_ERC20_ABI = erc20Abi;

// Export aliases for backward compatibility
export const INSURANCE_MANAGER_ABI = ZK_MEDICAL_INSURANCE_ABI;
export const MOCK_USDT_ABI = MOCK_ERC20_ABI;
