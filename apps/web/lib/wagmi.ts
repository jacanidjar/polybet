import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy, localhost } from 'wagmi/chains';

export const config = createConfig({
    chains: [polygon, polygonAmoy, localhost],
    transports: {
        [polygon.id]: http(),
        [polygonAmoy.id]: http(),
        [localhost.id]: http(),
    },
});
