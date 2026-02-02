/**
 * Merkle Tree Utilities for ZK Proofs
 * Used for membership proofs in medical records verification
 */

import { SNARK_FIELD, hashToField } from "./proof";

// Default tree depth
export const TREE_DEPTH = 20;

// Zero value for empty leaves
const ZERO_VALUE = BigInt(0);

/**
 * Simple hash function for Merkle tree
 * In production, use Poseidon or MiMC hash
 */
function merkleHash(left: bigint, right: bigint): bigint {
  // Simple combination hash (replace with Poseidon in production)
  return (left * BigInt(3) + right * BigInt(7) + BigInt(11)) % SNARK_FIELD;
}

/**
 * Merkle tree node
 */
interface MerkleNode {
  value: bigint;
  left?: MerkleNode;
  right?: MerkleNode;
}

/**
 * Merkle proof structure
 */
export interface MerkleProof {
  leaf: bigint;
  pathElements: bigint[];
  pathIndices: number[];
  root: bigint;
}

/**
 * Build a Merkle tree from leaves
 */
export function buildMerkleTree(leaves: bigint[]): { root: bigint; tree: bigint[][] } {
  if (leaves.length === 0) {
    return { root: ZERO_VALUE, tree: [[ZERO_VALUE]] };
  }
  
  // Pad to power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(leaves.length)));
  const paddedLeaves = [...leaves];
  while (paddedLeaves.length < size) {
    paddedLeaves.push(ZERO_VALUE);
  }
  
  const tree: bigint[][] = [paddedLeaves];
  let currentLevel = paddedLeaves;
  
  while (currentLevel.length > 1) {
    const nextLevel: bigint[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] ?? ZERO_VALUE;
      nextLevel.push(merkleHash(left, right));
    }
    tree.push(nextLevel);
    currentLevel = nextLevel;
  }
  
  return { root: currentLevel[0], tree };
}

/**
 * Get Merkle proof for a leaf at given index
 */
export function getMerkleProof(tree: bigint[][], leafIndex: number): MerkleProof {
  if (leafIndex >= tree[0].length) {
    throw new Error("Leaf index out of bounds");
  }
  
  const pathElements: bigint[] = [];
  const pathIndices: number[] = [];
  let currentIndex = leafIndex;
  
  for (let level = 0; level < tree.length - 1; level++) {
    const isRight = currentIndex % 2 === 1;
    const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
    
    pathElements.push(tree[level][siblingIndex] ?? ZERO_VALUE);
    pathIndices.push(isRight ? 1 : 0);
    
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  return {
    leaf: tree[0][leafIndex],
    pathElements,
    pathIndices,
    root: tree[tree.length - 1][0],
  };
}

/**
 * Verify a Merkle proof
 */
export function verifyMerkleProof(proof: MerkleProof): boolean {
  let currentHash = proof.leaf;
  
  for (let i = 0; i < proof.pathElements.length; i++) {
    const sibling = proof.pathElements[i];
    const isRight = proof.pathIndices[i] === 1;
    
    currentHash = isRight
      ? merkleHash(sibling, currentHash)
      : merkleHash(currentHash, sibling);
  }
  
  return currentHash === proof.root;
}

/**
 * Create a leaf from medical record data
 */
export function createMedicalRecordLeaf(data: {
  patientId: string;
  diagnosisCode: string;
  treatmentDate: number;
  providerId: string;
}): bigint {
  const combined = `${data.patientId}|${data.diagnosisCode}|${data.treatmentDate}|${data.providerId}`;
  return hashToField(combined);
}

/**
 * Build a tree from medical records
 */
export function buildMedicalRecordsTree(records: Array<{
  patientId: string;
  diagnosisCode: string;
  treatmentDate: number;
  providerId: string;
}>): { root: bigint; tree: bigint[][] } {
  const leaves = records.map(createMedicalRecordLeaf);
  return buildMerkleTree(leaves);
}

/**
 * Empty tree roots precomputed for different depths
 * Used for gas-efficient zero checks
 */
export function getEmptyTreeRoot(depth: number): bigint {
  let current = ZERO_VALUE;
  for (let i = 0; i < depth; i++) {
    current = merkleHash(current, current);
  }
  return current;
}
