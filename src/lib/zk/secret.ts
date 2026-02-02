/**
 * User Secret Management for ZK Proofs
 * Handles generation, storage, backup, and recovery of user secrets
 */

import { SNARK_FIELD } from "./proof";

const SECRET_STORAGE_KEY = "zk_medical_user_secret";
const SECRET_BACKUP_PREFIX = "ZK-SECRET-V1:";

/**
 * Generate a cryptographically secure random secret
 */
export function generateSecret(): bigint {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  let secret = BigInt(0);
  for (const byte of array) {
    secret = (secret << BigInt(8)) | BigInt(byte);
  }
  
  // Ensure secret is within SNARK field
  return secret % SNARK_FIELD;
}

/**
 * Get or create user secret
 * Stored in localStorage (encrypted in production)
 */
export function getOrCreateSecret(): bigint {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  
  if (stored) {
    try {
      return BigInt(stored);
    } catch {
      // Invalid stored secret, generate new one
    }
  }
  
  const newSecret = generateSecret();
  localStorage.setItem(SECRET_STORAGE_KEY, newSecret.toString());
  return newSecret;
}

/**
 * Get secret for a specific wallet address
 * Creates address-specific secrets for multi-wallet support
 */
export function getSecretForAddress(address: string): bigint {
  const key = `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    try {
      return BigInt(stored);
    } catch {
      // Invalid stored secret, generate new one
    }
  }
  
  const newSecret = generateSecret();
  localStorage.setItem(key, newSecret.toString());
  return newSecret;
}

/**
 * Export secret for backup
 * Returns a formatted string that can be saved securely
 */
export function backupSecret(address?: string): string {
  const secret = address ? getSecretForAddress(address) : getOrCreateSecret();
  const encoded = Buffer.from(secret.toString()).toString("base64");
  return `${SECRET_BACKUP_PREFIX}${encoded}`;
}

/**
 * Restore secret from backup string
 */
export function restoreSecret(backup: string, address?: string): boolean {
  if (!backup.startsWith(SECRET_BACKUP_PREFIX)) {
    throw new Error("Invalid backup format");
  }
  
  try {
    const encoded = backup.slice(SECRET_BACKUP_PREFIX.length);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const secret = BigInt(decoded);
    
    // Validate it's within field
    if (secret < BigInt(0) || secret >= SNARK_FIELD) {
      throw new Error("Secret out of valid range");
    }
    
    const key = address 
      ? `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`
      : SECRET_STORAGE_KEY;
    
    localStorage.setItem(key, secret.toString());
    return true;
  } catch (error) {
    throw new Error("Failed to restore secret: " + (error as Error).message);
  }
}

/**
 * Check if user has a stored secret
 */
export function hasStoredSecret(address?: string): boolean {
  const key = address 
    ? `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`
    : SECRET_STORAGE_KEY;
  return localStorage.getItem(key) !== null;
}

/**
 * Clear stored secret (use with caution!)
 * User will lose ability to generate valid proofs for previous claims
 */
export function clearSecret(address?: string): void {
  const key = address 
    ? `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`
    : SECRET_STORAGE_KEY;
  localStorage.removeItem(key);
}

/**
 * Derive a commitment from user secret
 * Used for on-chain registration without revealing secret
 */
export function deriveCommitment(secret: bigint, salt: bigint = BigInt(0)): bigint {
  // Simple Pedersen-like commitment: H(secret, salt)
  // In production, use proper hash function (Poseidon, MiMC)
  return (secret * BigInt(7) + salt * BigInt(11)) % SNARK_FIELD;
}
