// Insurance product
export interface Product {
  id: bigint;
  name: string;
  description: string;
  premium: bigint;
  coverageAmount: bigint;
  duration: bigint;
  insurer: `0x${string}`;
  isActive: boolean;
  poolBalance: bigint;
}

// Policy status enum
export enum PolicyStatus {
  Active = 0,
  Expired = 1,
  Cancelled = 2,
}

// User policy
export interface Policy {
  id: bigint;
  productId: bigint;
  holder: `0x${string}`;
  startTime: bigint;
  endTime: bigint;
  status: PolicyStatus;
}

// Claim status enum
export enum ClaimStatus {
  Submitted = 0,
  Verified = 1,
  Approved = 2,
  Rejected = 3,
  Paid = 4,
}

// Insurance claim
export interface Claim {
  id: bigint;
  policyId: bigint;
  claimant: `0x${string}`;
  amount: bigint;
  diseaseType: bigint;
  documentHash: `0x${string}`;
  status: ClaimStatus;
  proofVerified: boolean;
  submittedAt: bigint;
}

// ZK Proof structure
export interface ZKProof {
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}

// Disease types
export const DiseaseTypes = {
  1: "Cancer",
  2: "Heart Disease",
  3: "Stroke",
  4: "Diabetes",
  5: "Respiratory",
  6: "Other",
} as const;

export type DiseaseTypeId = keyof typeof DiseaseTypes;

// User roles
export interface UserRoles {
  isAdmin: boolean;
  isInsurer: boolean;
}
