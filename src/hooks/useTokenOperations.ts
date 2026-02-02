import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { MOCK_USDT_ABI } from "@/config/abis";
import { getContractAddress } from "@/config/contracts";

// Get token balance
export function useTokenBalance(tokenAddress?: `0x${string}`) {
  const { address, chainId } = useAccount();
  const usdtAddress = tokenAddress || getContractAddress(chainId, "MockUSDT");

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: usdtAddress,
    abi: MOCK_USDT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { balance, isLoading, error, refetch };
}

// Get token allowance
export function useTokenAllowance(spender: `0x${string}`, tokenAddress?: `0x${string}`) {
  const { address, chainId } = useAccount();
  const usdtAddress = tokenAddress || getContractAddress(chainId, "MockUSDT");

  const { data: allowance, isLoading, error, refetch } = useReadContract({
    address: usdtAddress,
    abi: MOCK_USDT_ABI,
    functionName: "allowance",
    args: address ? [address, spender] : undefined,
    query: {
      enabled: !!address && !!spender,
    },
  });

  return { allowance, isLoading, error, refetch };
}

// Approve token spending
export function useTokenApprove(tokenAddress?: `0x${string}`) {
  const { chainId } = useAccount();
  const usdtAddress = tokenAddress || getContractAddress(chainId, "MockUSDT");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (spender: `0x${string}`, amount: bigint) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: usdtAddress,
      abi: MOCK_USDT_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error, reset };
}

// Mint test tokens (only for MockUSDT)
export function useMintTestToken() {
  const { chainId } = useAccount();
  const usdtAddress = getContractAddress(chainId, "MockUSDT");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = (amount: bigint) => {
    // @ts-expect-error - wagmi infers account and chain from provider
    writeContract({
      address: usdtAddress,
      abi: MOCK_USDT_ABI,
      functionName: "mint",
      args: [amount],
    });
  };

  return { mint, hash, isPending, isConfirming, isSuccess, error, reset };
}

// Get token decimals
export function useTokenDecimals(tokenAddress?: `0x${string}`) {
  const { chainId } = useAccount();
  const usdtAddress = tokenAddress || getContractAddress(chainId, "MockUSDT");

  const { data: decimals, isLoading, error } = useReadContract({
    address: usdtAddress,
    abi: MOCK_USDT_ABI,
    functionName: "decimals",
  });

  return { decimals: decimals ?? 6, isLoading, error };
}
