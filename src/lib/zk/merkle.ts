/**
 * Merkle Tree Implementation for Disease Coverage
 * 用于疾病覆盖范围的 Merkle 树实现
 * 
 * 基于 Poseidon 哈希函数构建 Merkle 树
 */

import { buildPoseidon } from "circomlibjs";

export interface MerkleTree {
  depth: number;
  root: bigint;
  leaves: bigint[]; // 仅包含实际的哈希叶子（不含填充）
  layers: bigint[][]; // 所有层，包括填充后的完整树
  zeros: bigint[]; // 零节点数组
}

export interface MerkleProof {
  pathElements: bigint[];
  pathIndices: bigint[];
}

/**
 * 构建疾病覆盖范围的 Merkle 树
 * @param diseaseIds 疾病 ID 列表
 * @param depth 树的深度（默认16，支持最多 2^16 = 65536 个疾病）
 * @returns Merkle 树结构
 */
export async function buildCoveredTree(
  diseaseIds: number[],
  depth = 16
): Promise<MerkleTree> {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  // Poseidon 哈希函数
  const H1 = (a: bigint): bigint => F.toObject(poseidon([a])) as bigint;
  const H2 = (l: bigint, r: bigint): bigint => 
    F.toObject(poseidon([l, r])) as bigint;

  // 生成零节点数组（每层的默认值）
  const zeros: bigint[] = [0n];
  for (let i = 1; i <= depth; i++) {
    zeros[i] = H2(zeros[i - 1], zeros[i - 1]);
  }

  // 计算叶子节点哈希: leaf = Poseidon(diseaseId)
  const leavesHashed = diseaseIds.map((id) => H1(BigInt(id)));

  // 填充叶子节点到 2^depth
  const maxLeaves = 1 << depth;
  if (leavesHashed.length > maxLeaves) {
    throw new Error(
      `疾病数量 (${leavesHashed.length}) 超过树的最大容量 (${maxLeaves})`
    );
  }

  // 用零节点填充
  const leaves: bigint[] = [
    ...leavesHashed,
    ...Array(maxLeaves - leavesHashed.length).fill(zeros[0]),
  ];

  // 逐层构建 Merkle 树
  const layers: bigint[][] = [leaves];

  for (let lvl = 1; lvl <= depth; lvl++) {
    const prev = layers[lvl - 1];
    const cur: bigint[] = [];

    for (let i = 0; i < prev.length; i += 2) {
      cur.push(H2(prev[i], prev[i + 1]));
    }

    layers[lvl] = cur;
  }

  const root = layers[depth][0];

  return {
    depth,
    root,
    leaves: leavesHashed, // 只返回实际的叶子，不含填充
    layers,
    zeros,
  };
}

/**
 * 获取 Merkle 证明路径
 * @param tree Merkle 树
 * @param leafIndex 叶子索引（在实际叶子列表中的索引，不是填充后的）
 * @returns Merkle 证明（从叶子到根的路径）
 */
export function getMerkleProof(
  tree: MerkleTree,
  leafIndex: number
): MerkleProof {
  const { depth, layers } = tree;

  if (leafIndex < 0 || leafIndex >= tree.leaves.length) {
    throw new Error(
      `无效的叶子索引: ${leafIndex}，有效范围: 0-${tree.leaves.length - 1}`
    );
  }

  let idx = leafIndex;
  const pathElements: bigint[] = [];
  const pathIndices: bigint[] = [];

  // 从叶子层开始，逐层向上
  for (let lvl = 0; lvl < depth; lvl++) {
    const isRight = (idx & 1) === 1;
    const siblingIdx = isRight ? idx - 1 : idx + 1;

    // 添加兄弟节点
    pathElements.push(layers[lvl][siblingIdx]);
    // 添加路径方向（0=左，1=右）
    pathIndices.push(isRight ? 1n : 0n);

    // 移动到父节点
    idx = Math.floor(idx / 2);
  }

  return { pathElements, pathIndices };
}

/**
 * 验证 Merkle 证明
 * @param leaf 叶子值
 * @param proof Merkle 证明
 * @param root 预期的根
 * @returns 证明是否有效
 */
export async function verifyMerkleProof(
  leaf: bigint,
  proof: MerkleProof,
  root: bigint
): Promise<boolean> {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  const H2 = (l: bigint, r: bigint): bigint =>
    F.toObject(poseidon([l, r])) as bigint;

  let current = leaf;

  for (let i = 0; i < proof.pathElements.length; i++) {
    const sibling = proof.pathElements[i];
    const isRight = proof.pathIndices[i] === 1n;

    current = isRight ? H2(sibling, current) : H2(current, sibling);
  }

  return current === root;
}

/**
 * 查找疾病 ID 在树中的索引
 * @param diseaseIds 原始疾病 ID 列表
 * @param targetDiseaseId 要查找的疾病 ID
 * @returns 索引，如果不存在返回 -1
 */
export function findDiseaseIndex(
  diseaseIds: number[],
  targetDiseaseId: number
): number {
  return diseaseIds.indexOf(targetDiseaseId);
}

/**
 * 从 JSON 文件格式加载 Merkle 树
 * （用于从 Hardhat 生成的 coveredTree.json 加载）
 */
export interface TreeDump {
  depth: number;
  root: string;
  leaves: string[];
  zeros: string[];
  layers: string[][];
}

export function loadTreeFromDump(dump: TreeDump): MerkleTree {
  return {
    depth: dump.depth,
    root: BigInt(dump.root),
    leaves: dump.leaves.map((l) => BigInt(l)),
    layers: dump.layers.map((layer) => layer.map((v) => BigInt(v))),
    zeros: dump.zeros.map((z) => BigInt(z)),
  };
}

/**
 * 将 Merkle 树导出为 JSON 格式
 */
export function dumpTree(tree: MerkleTree): TreeDump {
  return {
    depth: tree.depth,
    root: tree.root.toString(),
    leaves: tree.leaves.map((l) => l.toString()),
    zeros: tree.zeros.map((z) => z.toString()),
    layers: tree.layers.map((layer) => layer.map((v) => v.toString())),
  };
}
