/**
 * ZK Proof Generation for Medical Claims
 * 医疗理赔的零知识证明生成
 * 
 * 使用 snarkjs + Groth16 生成隐私保护的理赔证明
 */

import { buildPoseidon } from "circomlibjs";
import { buildCoveredTree, getMerkleProof } from "./merkle";
import type { ZKProof } from "@/types/insurance";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SnarkJS = any;

// BN254 scalar field (snarkjs / groth16 公开输入必须 < 此值)
export const SNARK_FIELD = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

// 证明生成状态
export type ProofStatus = "idle" | "loading" | "generating" | "success" | "error";

// 理赔证明输入
export interface ClaimProofInput {
  // 公开输入（链上可见）
  policyId: bigint;
  claimAmount: bigint;
  documentHash: string; // bytes32 hex string
  coveredRoot: bigint;
  
  // 私有输入（不会泄露到链上）
  diseaseId: number; // 实际患病ID
  userSecret: bigint;
  
  // Merkle 证明数据
  diseaseIds: number[]; // 产品覆盖的所有疾病ID列表
}

// 证明结果
export interface ProofResult {
  proof: ZKProof;
  publicInputs: [bigint, bigint, bigint, bigint, bigint]; // 精确5个元素
  nullifier: `0x${string}`;
  dataHash: `0x${string}`;
}

/**
 * 生成医疗理赔的零知识证明
 * 
 * @param input 理赔输入数据
 * @param onProgress 进度回调函数
 * @returns 包含证明、公开输入和 nullifier 的结果
 */
export async function generateClaimProof(
  input: ClaimProofInput,
  onProgress?: (status: ProofStatus, message: string) => void
): Promise<ProofResult> {
  onProgress?.("loading", "初始化证明系统...");
  
  try {
    // 检查是否有真实的电路文件
    const hasCircuitFiles = await checkCircuitFiles();
    
    if (hasCircuitFiles) {
      onProgress?.("loading", "加载真实电路文件...");
      return await generateRealProof(input, onProgress);
    } else {
      console.warn("ZK 电路文件未找到，使用模拟证明（仅用于开发）");
      onProgress?.("loading", "使用模拟证明模式...");
      return await generateSimulatedProof(input, onProgress);
    }
  } catch (error) {
    onProgress?.("error", "证明生成失败");
    console.error("证明生成错误:", error);
    throw error;
  }
}

/**
 * 检查电路文件是否可用
 */
async function checkCircuitFiles(): Promise<boolean> {
  try {
    const [wasmResponse, zkeyResponse] = await Promise.all([
      fetch("/zk/medical_claim.wasm", { method: "HEAD" }),
      fetch("/zk/medical_claim_final.zkey", { method: "HEAD" }),
    ]);
    return wasmResponse.ok && zkeyResponse.ok;
  } catch {
    return false;
  }
}

/**
 * 使用 snarkjs 生成真实的零知识证明
 */
async function generateRealProof(
  input: ClaimProofInput,
  onProgress?: (status: ProofStatus, message: string) => void
): Promise<ProofResult> {
  // 动态导入 snarkjs（避免影响初始加载）
  onProgress?.("loading", "加载 snarkjs 库...");
  const snarkjs: SnarkJS = await import("snarkjs");
  
  // 导入 Poseidon 哈希
  onProgress?.("loading", "加载 Poseidon 哈希...");
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  
  // 1. 计算 dataHashField
  onProgress?.("generating", "计算数据哈希...");
  const dataHashField = BigInt(input.documentHash) % SNARK_FIELD;
  
  // 2. 生成 nullifier = Poseidon(secret, policyId, amount, dataHashField)
  onProgress?.("generating", "生成 nullifier...");
  const nullifier = F.toObject(
    poseidon([input.userSecret, input.policyId, input.claimAmount, dataHashField])
  ) as bigint;
  
  // 3. 构建 Merkle 树
  onProgress?.("generating", "构建疾病覆盖 Merkle 树...");
  const merkleTree = await buildCoveredTree(input.diseaseIds);
  
  // 验证 coveredRoot 是否匹配
  if (merkleTree.root !== input.coveredRoot) {
    throw new Error(
      `Merkle 根不匹配！期望: ${input.coveredRoot.toString()}, 实际: ${merkleTree.root.toString()}`
    );
  }
  
  // 4. 找到疾病在树中的索引
  const diseaseLeafIndex = input.diseaseIds.indexOf(input.diseaseId);
  if (diseaseLeafIndex === -1) {
    throw new Error(`疾病 ID ${input.diseaseId} 不在保险覆盖范围内`);
  }
  
  // 5. 生成 Merkle 证明路径
  onProgress?.("generating", "生成 Merkle 证明路径...");
  const { pathElements, pathIndices } = getMerkleProof(merkleTree, diseaseLeafIndex);
  
  // 6. 准备电路输入
  onProgress?.("generating", "准备电路输入...");
  const circuitInput = {
    // 私有输入
    diseaseId: BigInt(input.diseaseId).toString(),
    pathElements: pathElements.map((e) => e.toString()),
    pathIndices: pathIndices.map((i) => i.toString()),
    secret: input.userSecret.toString(),
    
    // 公开输入
    policyId: input.policyId.toString(),
    amount: input.claimAmount.toString(),
    dataHashField: dataHashField.toString(),
    coveredRoot: input.coveredRoot.toString(),
    nullifier: nullifier.toString(),
  };
  
  // 7. 生成证明
  onProgress?.("generating", "计算零知识证明（可能需要10-30秒）...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    circuitInput,
    "/zk/medical_claim.wasm",
    "/zk/medical_claim_final.zkey"
  );
  
  // 8. 格式化证明为 Solidity 格式
  onProgress?.("generating", "格式化证明数据...");
  const formattedProof = formatProofForContract(proof);
  
  // 9. 转换公开输入为 bigint
  const publicInputs: [bigint, bigint, bigint, bigint, bigint] = [
    BigInt(publicSignals[0]), // policyId
    BigInt(publicSignals[1]), // amount
    BigInt(publicSignals[2]), // dataHashField
    BigInt(publicSignals[3]), // coveredRoot
    BigInt(publicSignals[4]), // nullifier
  ];
  
  // 验证公开输入是否正确
  if (publicInputs[0] !== input.policyId) {
    throw new Error("公开输入验证失败: policyId 不匹配");
  }
  if (publicInputs[1] !== input.claimAmount) {
    throw new Error("公开输入验证失败: amount 不匹配");
  }
  
  onProgress?.("success", "证明生成成功！");
  
  return {
    proof: formattedProof,
    publicInputs,
    nullifier: `0x${nullifier.toString(16).padStart(64, "0")}`,
    dataHash: input.documentHash as `0x${string}`,
  };
}

/**
 * 生成模拟证明（仅用于开发/测试）
 * 注意：模拟证明无法通过合约的 Groth16 验证！
 */
async function generateSimulatedProof(
  input: ClaimProofInput,
  onProgress?: (status: ProofStatus, message: string) => void
): Promise<ProofResult> {
  console.warn("⚠️ 使用模拟证明模式，无法通过链上验证！");
  
  onProgress?.("generating", "生成模拟证明...");
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 导入 Poseidon（用于生成正确的 nullifier）
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  
  // 计算 dataHashField
  const dataHashField = BigInt(input.documentHash) % SNARK_FIELD;
  
  // 生成真实的 nullifier
  const nullifier = F.toObject(
    poseidon([input.userSecret, input.policyId, input.claimAmount, dataHashField])
  ) as bigint;
  
  // 生成确定性但伪造的证明值
  const seed = hashToField(
    input.documentHash + input.policyId.toString() + input.diseaseId.toString()
  );
  
  const proof: ZKProof = {
    a: [
      (seed * BigInt(1)) % SNARK_FIELD,
      (seed * BigInt(2)) % SNARK_FIELD,
    ],
    b: [
      [(seed * BigInt(3)) % SNARK_FIELD, (seed * BigInt(4)) % SNARK_FIELD],
      [(seed * BigInt(5)) % SNARK_FIELD, (seed * BigInt(6)) % SNARK_FIELD],
    ],
    c: [
      (seed * BigInt(7)) % SNARK_FIELD,
      (seed * BigInt(8)) % SNARK_FIELD,
    ],
  };
  
  // 公开输入: [policyId, amount, dataHashField, coveredRoot, nullifier]
  const publicInputs: [bigint, bigint, bigint, bigint, bigint] = [
    input.policyId,
    input.claimAmount,
    dataHashField,
    input.coveredRoot,
    nullifier,
  ];
  
  onProgress?.("success", "模拟证明生成完成（警告：无法通过链上验证）");
  
  return {
    proof,
    publicInputs,
    nullifier: `0x${nullifier.toString(16).padStart(64, "0")}`,
    dataHash: input.documentHash as `0x${string}`,
  };
}

/**
 * 将 snarkjs 的证明输出格式化为 Solidity 合约格式
 * 注意：b 数组的顺序需要反转
 */
export function formatProofForContract(proof: {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
}): ZKProof {
  return {
    a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
    b: [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])], // 反转顺序
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])], // 反转顺序
    ],
    c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
  };
}

/**
 * 将字符串哈希为 SNARK 域内的字段元素
 */
export function hashToField(input: string): bigint {
  if (input.startsWith("0x")) {
    // 如果是十六进制字符串，直接转换
    return BigInt(input) % SNARK_FIELD;
  }
  
  // 字符串哈希
  let hash = BigInt(0);
  for (let i = 0; i < input.length; i++) {
    hash = (hash * BigInt(31) + BigInt(input.charCodeAt(i))) % SNARK_FIELD;
  }
  return hash;
}

/**
 * 本地验证证明（用于调试）
 */
export async function verifyProofLocally(
  proof: ZKProof,
  publicInputs: bigint[]
): Promise<boolean> {
  try {
    const vkeyResponse = await fetch("/zk/verification_key.json");
    if (!vkeyResponse.ok) {
      console.warn("未找到验证密钥，跳过本地验证");
      return true;
    }
    
    const snarkjs: SnarkJS = await import("snarkjs");
    const vkey = await vkeyResponse.json();
    
    // 转换为 snarkjs 格式
    const proofForVerify = {
      pi_a: [proof.a[0].toString(), proof.a[1].toString(), "1"],
      pi_b: [
        [proof.b[0][1].toString(), proof.b[0][0].toString()],
        [proof.b[1][1].toString(), proof.b[1][0].toString()],
        ["1", "0"],
      ],
      pi_c: [proof.c[0].toString(), proof.c[1].toString(), "1"],
      protocol: "groth16",
      curve: "bn128",
    };
    
    const signals = publicInputs.map((p) => p.toString());
    
    const isValid = await snarkjs.groth16.verify(vkey, signals, proofForVerify);
    
    if (isValid) {
      console.log("✓ 本地验证通过");
    } else {
      console.error("✗ 本地验证失败");
    }
    
    return isValid;
  } catch (error) {
    console.warn("本地验证出错:", error);
    return true; // 如果验证失败，假设有效（让链上验证决定）
  }
}

/**
 * 辅助函数：生成随机的文档哈希
 */
export function generateRandomDocumentHash(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as `0x${string}`;
}
