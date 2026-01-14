const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    // 1. Deploy MockUSDC
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();

    console.log(`MockUSDC deployed to: ${usdcAddress}`);

    // 2. Deploy PolybetMarket
    const PolybetMarket = await hre.ethers.getContractFactory("PolybetMarket");
    // Market needs USDC address in constructor
    const market = await PolybetMarket.deploy(usdcAddress);
    await market.waitForDeployment();
    const marketAddress = await market.getAddress();

    console.log(`PolybetMarket deployed to: ${marketAddress}`);

    // 3. Setup Initial State (Matching seed.ts)
    console.log("Seeding initial markets to match Database...");

    // Approve Market to spend Admin's USDC for liquidity
    const initialLiquidity = 10000n * 1000000n; // 10,000 USDC per market
    await usdc.approve(marketAddress, initialLiquidity * 10n);
    console.log("Approved market to spend USDC");

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Market 1: Bitcoin (Matches seed.ts)
    const endTime1 = Math.floor(new Date('2024-12-31T23:59:59Z').getTime() / 1000);
    // Use fallback if date passed, just 30 days in future for testing
    const validEndTime1 = endTime1 > currentTimestamp ? endTime1 : currentTimestamp + 86400 * 30;

    await (await market.createMarket("Bitcoin to hit $100k by 2024?", validEndTime1, initialLiquidity)).wait();
    console.log("Market #1 (Bitcoin) created!");

    // Market 2: Fed Rate Cut (Matches seed.ts)
    const endTime2 = Math.floor(new Date('2024-03-31T23:59:59Z').getTime() / 1000);
    const validEndTime2 = endTime2 > currentTimestamp ? endTime2 : currentTimestamp + 86400 * 30;

    await (await market.createMarket("Fed to cut rates in March?", validEndTime2, initialLiquidity)).wait();
    console.log("Market #2 (Fed) created!");

    // Save to frontend file
    const fs = require("fs");
    const path = require("path");
    const contractsDir = path.join(__dirname, "..", "..", "..", "apps", "web", "lib");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    const configPath = path.join(contractsDir, "contracts-config.json");
    const savedData = {
        MARKET_ADDRESS: marketAddress,
        USDC_ADDRESS: usdcAddress,
        NETWORK_ID: "31337"
    };

    fs.writeFileSync(configPath, JSON.stringify(savedData, null, 2));
    console.log(`Config saved to: ${configPath}`);

    console.log("Deployment complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
