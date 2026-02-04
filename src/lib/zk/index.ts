/**
 * ZK Proof Utilities Export
 */

export {
  generateClaimProof,
  hashToField,
  formatProofForContract,
  verifyProofLocally,
  generateRandomDocumentHash,
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
  buildCoveredTree,
  getMerkleProof,
  verifyMerkleProof,
  findDiseaseIndex,
  loadTreeFromDump,
  dumpTree,
  type MerkleTree,
  type MerkleProof,
  type TreeDump,
} from "./merkle";
