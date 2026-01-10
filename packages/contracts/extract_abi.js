const fs = require('fs');
const path = require('path');

const marketPath = path.join(__dirname, 'artifacts/contracts/PolybetMarket.sol/PolybetMarket.json');
const usdcPath = path.join(__dirname, 'artifacts/contracts/MockUSDC.sol/MockUSDC.json');

const market = require(marketPath);
const usdc = require(usdcPath);

const targetDir = path.join(__dirname, '../../apps/web/lib/contracts');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(path.join(targetDir, 'PolybetMarket.json'), JSON.stringify(market.abi, null, 2));
fs.writeFileSync(path.join(targetDir, 'MockUSDC.json'), JSON.stringify(usdc.abi, null, 2));

console.log('✅ ABIs extracted to apps/web/lib/contracts/');
