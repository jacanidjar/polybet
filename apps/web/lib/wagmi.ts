import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { defineChain } from 'viem';

export const hardhat = defineChain({
    id: 31337,
    name: 'Hardhat Local',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
    },
});

export const config = createConfig({
    chains: [polygon, polygonAmoy, hardhat],
    transports: {
        [polygon.id]: http(),
        [polygonAmoy.id]: http(),
        [hardhat.id]: http(),
    },
});
