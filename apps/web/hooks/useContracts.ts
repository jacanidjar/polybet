import { type Address } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import PolybetMarketABI from '@/lib/contracts/PolybetMarket.json';
import MockUSDCABI from '@/lib/contracts/MockUSDC.json';

// Configuration
// TODO: Replace with env vars or deployed output
const MARKET_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost default

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
    return { allowance: allowance as bigint || 0n, refetch };
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
