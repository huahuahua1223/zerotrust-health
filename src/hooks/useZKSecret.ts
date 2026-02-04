/**
 * User Secret Management for ZK Proofs
 * ZK 证明的用户密钥管理
 * 
 * 密钥用于生成 nullifier，防止重复理赔
 * 密钥存储在 localStorage 中，按钱包地址隔离
 */

import { SNARK_FIELD } from "@/lib/zk/proof";

const SECRET_STORAGE_KEY = "zk_medical_user_secret";
const SECRET_BACKUP_PREFIX = "ZK-SECRET-V1:";

/**
 * 生成密码学安全的随机密钥
 */
export function generateSecret(): bigint {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  let secret = BigInt(0);
  for (const byte of array) {
    secret = (secret << BigInt(8)) | BigInt(byte);
  }
  
  // 确保密钥在 SNARK 域内
  return secret % SNARK_FIELD;
}

/**
 * 为特定钱包地址获取或创建密钥
 * 每个地址有独立的密钥
 */
export function getSecretForAddress(address: string): bigint {
  const key = `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    try {
      const secret = BigInt(stored);
      // 验证密钥有效性
      if (secret > 0n && secret < SNARK_FIELD) {
        return secret;
      }
    } catch {
      console.warn("存储的密钥无效，生成新密钥");
    }
  }
  
  // 生成新密钥
  const newSecret = generateSecret();
  localStorage.setItem(key, newSecret.toString());
  
  console.log("✓ 为地址生成新密钥:", address.slice(0, 10) + "...");
  
  return newSecret;
}

/**
 * 获取或创建全局密钥（不绑定地址）
 */
export function getOrCreateSecret(): bigint {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  
  if (stored) {
    try {
      const secret = BigInt(stored);
      if (secret > 0n && secret < SNARK_FIELD) {
        return secret;
      }
    } catch {
      // 无效的密钥
    }
  }
  
  const newSecret = generateSecret();
  localStorage.setItem(SECRET_STORAGE_KEY, newSecret.toString());
  return newSecret;
}

/**
 * 检查是否已存储密钥
 */
export function hasStoredSecret(address?: string): boolean {
  const key = address 
    ? `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`
    : SECRET_STORAGE_KEY;
  return localStorage.getItem(key) !== null;
}

/**
 * 导出密钥用于备份
 * 返回格式化的字符串，可安全保存
 */
export function backupSecret(address?: string): string {
  const secret = address ? getSecretForAddress(address) : getOrCreateSecret();
  const encoded = btoa(secret.toString());
  return `${SECRET_BACKUP_PREFIX}${encoded}`;
}

/**
 * 从备份字符串恢复密钥
 */
export function restoreSecret(backup: string, address?: string): boolean {
  if (!backup.startsWith(SECRET_BACKUP_PREFIX)) {
    throw new Error("备份格式无效");
  }
  
  try {
    const encoded = backup.slice(SECRET_BACKUP_PREFIX.length);
    const decoded = atob(encoded);
    const secret = BigInt(decoded);
    
    // 验证密钥范围
    if (secret <= 0n || secret >= SNARK_FIELD) {
      throw new Error("密钥超出有效范围");
    }
    
    const key = address 
      ? `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`
      : SECRET_STORAGE_KEY;
    
    localStorage.setItem(key, secret.toString());
    
    console.log("✓ 密钥恢复成功");
    return true;
  } catch (error) {
    throw new Error("恢复密钥失败: " + (error as Error).message);
  }
}

/**
 * 清除存储的密钥（谨慎使用！）
 * 警告：清除密钥后将无法为之前的理赔生成有效证明
 */
export function clearSecret(address?: string): void {
  const key = address 
    ? `${SECRET_STORAGE_KEY}_${address.toLowerCase()}`
    : SECRET_STORAGE_KEY;
  localStorage.removeItem(key);
  
  console.warn("⚠️ 密钥已清除:", key);
}

/**
 * 列出所有存储的密钥（用于管理）
 */
export function listStoredSecrets(): Array<{ address: string; hasSecret: boolean }> {
  const secrets: Array<{ address: string; hasSecret: boolean }> = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SECRET_STORAGE_KEY)) {
      const address = key.replace(`${SECRET_STORAGE_KEY}_`, "");
      secrets.push({
        address,
        hasSecret: true,
      });
    }
  }
  
  return secrets;
}
