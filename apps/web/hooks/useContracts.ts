import { type Address } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import PolybetMarketABI from '@/lib/contracts/PolybetMarket.json';
import MockUSDCABI from '@/lib/contracts/MockUSDC.json';

// Configuration
// TODO: Replace with env vars or deployed output
import CONTRACT_CONFIG from '@/lib/contracts-config.json';

const MARKET_ADDRESS = CONTRACT_CONFIG.MARKET_ADDRESS;
const USDC_ADDRESS = CONTRACT_CONFIG.USDC_ADDRESS;

export const useMarketContract = () => {
    return {
        address: MARKET_ADDRESS as Address,
        abi: PolybetMarketABI,
    };
};

export const useTokenContract = () => {
    return {
        address: USDC_ADDRESS as Address,
        abi: MockUSDCABI,
    };
};

// Hook to check allowance
export const useCheckAllowance = (userAddress: Address | undefined) => {
    const { data: allowance, refetch } = useReadContract({
        address: USDC_ADDRESS as Address,
        abi: MockUSDCABI,
        functionName: 'allowance',
        args: userAddress ? [userAddress, MARKET_ADDRESS] : undefined,
    });
    return { allowance: allowance as bigint || BigInt(0), refetch };
};

// Hook to approve spending
export const useApproveToken = () => {
    const { writeContractAsync, isPending, data: hash } = useWriteContract();

    const approve = async (amount: bigint) => {
        return writeContractAsync({
            address: USDC_ADDRESS as Address,
            abi: MockUSDCABI,
            functionName: 'approve',
            args: [MARKET_ADDRESS, amount],
        });
    };

    return { approve, isPending, hash };
};

// Hook to Buy Shares
export const useBuyShares = () => {
    const { writeContractAsync, isPending, data: hash } = useWriteContract();

    const buy = async (marketId: number, outcome: number, amount: bigint) => {
        // outcome: 1 = YES, 2 = NO
        return writeContractAsync({
            address: MARKET_ADDRESS as Address,
            abi: PolybetMarketABI,
            functionName: 'buy',
            args: [BigInt(marketId), outcome, amount],
        });
    };

    return { buy, isPending, hash };
};

// Hook to Sell Shares
export const useSellShares = () => {
    const { writeContractAsync, isPending, data: hash } = useWriteContract();

    const sell = async (marketId: number, outcome: number, shares: bigint) => {
        return writeContractAsync({
            address: MARKET_ADDRESS as Address,
            abi: PolybetMarketABI,
            functionName: 'sell',
            args: [BigInt(marketId), outcome, shares],
        });
    };

    return { sell, isPending, hash };
};

// Hook to check USDC Balance
export const useUSDCBalance = (userAddress: Address | undefined) => {
    const { data: balance, refetch, isLoading } = useReadContract({
        address: USDC_ADDRESS as Address,
        abi: MockUSDCABI,
        functionName: 'balanceOf',
        args: userAddress ? [userAddress] : undefined,
        query: {
            refetchInterval: 2000,
        }
    });
    return { balance: balance as bigint || BigInt(0), refetch, isLoading };
};

// Hook to Mint Fake USDC
export const useMintUSDC = () => {
    const { writeContractAsync, isPending, data: hash } = useWriteContract();

    const mint = async (to: Address, amount: bigint) => {
        return writeContractAsync({
            address: USDC_ADDRESS as Address,
            abi: MockUSDCABI,
            functionName: 'mint',
            args: [to, amount],
        });
    };

    return { mint, isPending, hash };
};

// Hook to Claim Winnings
export const useClaimWinnings = () => {
    const { writeContractAsync, isPending, data: hash } = useWriteContract();

    const claim = async (marketId: number) => {
        return writeContractAsync({
            address: MARKET_ADDRESS as Address,
            abi: PolybetMarketABI,
            functionName: 'claimWinnings',
            args: [BigInt(marketId)],
        });
    };

    return { claim, isPending, hash };
};

// Hook to Resolve Market (Admin only)
export const useResolveMarket = () => {
    const { writeContractAsync, isPending, data: hash } = useWriteContract();

    const resolve = async (marketId: number, outcome: number) => {
        // outcome: 1 = YES, 2 = NO
        return writeContractAsync({
            address: MARKET_ADDRESS as Address,
            abi: PolybetMarketABI,
            functionName: 'resolveMarket',
            args: [BigInt(marketId), outcome],
        });
    };

    return { resolve, isPending, hash };
};
