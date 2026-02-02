/**
 * Contract Error Parser
 * Converts contract revert messages to user-friendly error messages
 */

import { BaseError, ContractFunctionRevertedError } from "viem";

// Known contract error signatures
const CONTRACT_ERRORS: Record<string, { message: string; action?: string }> = {
  // Product errors
  ProductNotFound: {
    message: "The requested insurance product does not exist.",
    action: "Please select a valid product from the list.",
  },
  ProductNotActive: {
    message: "This insurance product is currently not available for purchase.",
    action: "Please choose another product or contact the insurer.",
  },
  ProductAlreadyExists: {
    message: "A product with this ID already exists.",
    action: "Please use a different product configuration.",
  },
  
  // Policy errors
  PolicyNotFound: {
    message: "The requested policy does not exist.",
    action: "Please check your policy ID.",
  },
  PolicyExpired: {
    message: "This policy has expired.",
    action: "You cannot submit claims for expired policies.",
  },
  PolicyNotActive: {
    message: "This policy is not currently active.",
    action: "Please check the policy status.",
  },
  AlreadyHasPolicy: {
    message: "You already have an active policy for this product.",
    action: "You cannot purchase duplicate policies.",
  },
  
  // Claim errors
  ClaimNotFound: {
    message: "The requested claim does not exist.",
    action: "Please check the claim ID.",
  },
  ClaimAlreadyProcessed: {
    message: "This claim has already been processed.",
    action: "No further action can be taken on this claim.",
  },
  AmountExceedsCoverage: {
    message: "The claim amount exceeds your policy coverage.",
    action: "Please reduce the claim amount or contact support.",
  },
  ClaimAmountTooHigh: {
    message: "The claim amount is too high.",
    action: "Please verify the claim amount.",
  },
  
  // ZK Proof errors
  InvalidProof: {
    message: "The zero-knowledge proof verification failed.",
    action: "Please regenerate the proof and try again.",
  },
  NullifierAlreadyUsed: {
    message: "This claim has already been submitted.",
    action: "You cannot submit the same claim twice.",
  },
  ProofVerificationFailed: {
    message: "Proof verification failed on-chain.",
    action: "Please ensure your medical records are valid.",
  },
  
  // Pool errors
  PoolInsufficient: {
    message: "The insurance pool does not have enough funds.",
    action: "Please wait for the pool to be funded or contact the insurer.",
  },
  InsufficientPoolBalance: {
    message: "Insufficient funds in the insurance pool.",
    action: "The insurer needs to add more funds to the pool.",
  },
  
  // Access control errors
  Unauthorized: {
    message: "You are not authorized to perform this action.",
    action: "Please connect with an authorized wallet.",
  },
  NotInsurer: {
    message: "Only insurers can perform this action.",
    action: "You need insurer privileges for this operation.",
  },
  NotAdmin: {
    message: "Only administrators can perform this action.",
    action: "You need admin privileges for this operation.",
  },
  NotClaimant: {
    message: "Only the claim owner can perform this action.",
    action: "Please use the wallet that submitted the claim.",
  },
  NotPolicyHolder: {
    message: "Only the policy holder can perform this action.",
    action: "Please use the wallet that owns the policy.",
  },
  
  // Token errors
  InsufficientBalance: {
    message: "You don't have enough tokens.",
    action: "Please add funds to your wallet.",
  },
  InsufficientAllowance: {
    message: "Token approval is required.",
    action: "Please approve the token transfer first.",
  },
  TransferFailed: {
    message: "Token transfer failed.",
    action: "Please check your balance and try again.",
  },
  
  // General errors
  InvalidInput: {
    message: "Invalid input provided.",
    action: "Please check your input values.",
  },
  Paused: {
    message: "The contract is currently paused.",
    action: "Please try again later.",
  },
  ReentrancyGuard: {
    message: "Transaction blocked for security.",
    action: "Please try again.",
  },
};

// Common RPC error codes
const RPC_ERRORS: Record<number, string> = {
  4001: "Transaction rejected by user.",
  4100: "Wallet is not authorized.",
  4200: "Unsupported method.",
  4900: "Wallet is disconnected.",
  4901: "Chain is not connected.",
  [-32000]: "Transaction underpriced. Try increasing gas.",
  [-32002]: "Request already pending. Please wait.",
  [-32003]: "Transaction rejected.",
  [-32602]: "Invalid parameters.",
  [-32603]: "Internal JSON-RPC error.",
};

export interface ParsedError {
  title: string;
  message: string;
  action?: string;
  isUserRejection: boolean;
  originalError: Error;
}

/**
 * Parse contract error to user-friendly message
 */
export function parseContractError(error: unknown): ParsedError {
  const originalError = error instanceof Error ? error : new Error(String(error));
  
  // Check if user rejected transaction
  if (isUserRejection(error)) {
    return {
      title: "Transaction Cancelled",
      message: "You cancelled the transaction.",
      isUserRejection: true,
      originalError,
    };
  }
  
  // Try to extract revert reason
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName;
      
      if (errorName && CONTRACT_ERRORS[errorName]) {
        const { message, action } = CONTRACT_ERRORS[errorName];
        return {
          title: formatErrorName(errorName),
          message,
          action,
          isUserRejection: false,
          originalError,
        };
      }
      
      // Try to get error message from args
      const args = revertError.data?.args;
      if (args && args.length > 0) {
        return {
          title: "Transaction Failed",
          message: String(args[0]),
          isUserRejection: false,
          originalError,
        };
      }
    }
  }
  
  // Check for RPC errors
  const rpcError = extractRPCError(error);
  if (rpcError) {
    return {
      title: "Network Error",
      message: rpcError,
      isUserRejection: false,
      originalError,
    };
  }
  
  // Check for known error patterns in message
  const errorMessage = originalError.message.toLowerCase();
  for (const [key, { message, action }] of Object.entries(CONTRACT_ERRORS)) {
    if (errorMessage.includes(key.toLowerCase())) {
      return {
        title: formatErrorName(key),
        message,
        action,
        isUserRejection: false,
        originalError,
      };
    }
  }
  
  // Network/connection errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return {
      title: "Connection Error",
      message: "Unable to connect to the blockchain network.",
      action: "Please check your internet connection and try again.",
      isUserRejection: false,
      originalError,
    };
  }
  
  // Generic fallback
  return {
    title: "Transaction Failed",
    message: originalError.message || "An unexpected error occurred.",
    action: "Please try again or contact support.",
    isUserRejection: false,
    originalError,
  };
}

/**
 * Check if error is user rejection
 */
function isUserRejection(error: unknown): boolean {
  if (!error) return false;
  
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  return (
    message.includes("user rejected") ||
    message.includes("user denied") ||
    message.includes("user cancelled") ||
    message.includes("rejected the request") ||
    (error as { code?: number })?.code === 4001
  );
}

/**
 * Extract RPC error message
 */
function extractRPCError(error: unknown): string | null {
  const code = (error as { code?: number })?.code;
  if (code && RPC_ERRORS[code]) {
    return RPC_ERRORS[code];
  }
  return null;
}

/**
 * Format error name to readable title
 */
function formatErrorName(name: string): string {
  // Split camelCase and add spaces
  return name
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Get short error message for toast notifications
 */
export function getShortErrorMessage(error: unknown): string {
  const parsed = parseContractError(error);
  return parsed.message.length > 100
    ? parsed.message.slice(0, 97) + "..."
    : parsed.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const parsed = parseContractError(error);
  
  // Don't retry user rejections
  if (parsed.isUserRejection) return false;
  
  const message = parsed.message.toLowerCase();
  
  // Retryable errors
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("try again") ||
    message.includes("underpriced")
  );
}
