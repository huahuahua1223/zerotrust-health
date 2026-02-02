/**
 * ZK Proof Utilities Export
 */

export {
  generateClaimProof,
  hashToField,
  generateNullifier,
  formatProofForContract,
  verifyProofLocally,
  SNARK_FIELD,
  type ClaimProofInput,
  type ProofResult,
  type ProofStatus,
} from "./proof";

export {
  generateSecret,
  getOrCreateSecret,
  getSecretForAddress,
  backupSecret,
  restoreSecret,
  hasStoredSecret,
  clearSecret,
  deriveCommitment,
} from "./secret";

export {
  buildMerkleTree,
  getMerkleProof,
  verifyMerkleProof,
  createMedicalRecordLeaf,
  buildMedicalRecordsTree,
  getEmptyTreeRoot,
  TREE_DEPTH,
  type MerkleProof,
} from "./merkle";
