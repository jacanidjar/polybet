import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Polybet',
    projectId: 'YOUR_PROJECT_ID',
    chains: [polygon, polygonAmoy],
    ssr: true,
});
