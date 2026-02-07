// Insurance product (aligned with contract)
export interface Product {
  id: bigint;
  insurer: `0x${string}`;
  token: `0x${string}`;
  premiumAmount: bigint;
  maxCoverage: bigint;
  coveragePeriodDays: number;
  coveredRoot: `0x${string}`;
  active: boolean;
  createdAt: bigint;
  uri: string;
  poolBalance?: bigint; // 资金池余额（可选，因为不是所有接口都返回）
}

// Product metadata (from URI)
export interface ProductMetadata {
  name: string;
  description: string;
  image?: string;
  diseases: number[];
  [key: string]: any;
}

// Product with metadata
export interface ProductWithMetadata extends Product {
  metadata?: ProductMetadata;
  poolBalance?: bigint;
}

// Policy status enum
export enum PolicyStatus {
  Active = 0,
  Expired = 1,
  Cancelled = 2,
}

// User policy (aligned with contract)
export interface Policy {
  id: bigint;
  productId: bigint;
  holder: `0x${string}`;
  startAt: bigint;
  endAt: bigint;
  status: PolicyStatus;
  createdAt: bigint;
}

// Policy with product info
export interface PolicyWithProduct extends Policy {
  product?: ProductWithMetadata;
}

// Claim status enum
export enum ClaimStatus {
  Submitted = 0,
  Verified = 1,
  Approved = 2,
  Rejected = 3,
  Paid = 4,
}

// Insurance claim (aligned with contract)
export interface Claim {
  id: bigint;
  policyId: bigint;
  claimant: `0x${string}`;
  amount: bigint;
  dataHash: `0x${string}`;
  nullifier: `0x${string}`;
  publicSignalsHash: `0x${string}`;
  status: ClaimStatus;
  submittedAt: bigint;
  decidedAt: bigint;
  paidAt: bigint;
  decisionMemoHash: `0x${string}`;
}

// Claim with related info
export interface ClaimWithDetails extends Claim {
  policy?: Policy;
  product?: ProductWithMetadata;
}

// ZK Proof structure
export interface ZKProof {
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}

// User roles
export interface UserRoles {
  isAdmin: boolean;
  isInsurer: boolean;
}
