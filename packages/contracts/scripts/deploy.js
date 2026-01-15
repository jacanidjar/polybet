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
    const defaultEndTime = currentTimestamp + 86400 * 30; // 30 days from now

    // All 10 markets matching backend seed (markets.service.ts)
    const MARKETS = [
        "Will Trump win the 2024 Election?",           // Market #1 - Politics
        "Bitcoin to hit $100k in 2024?",               // Market #2 - Crypto
        "Fed to cut rates in March?",                  // Market #3 - Business
        "SpaceX Starship launch successful?",          // Market #4 - Science
        "Lakers to win NBA Championship?",             // Market #5 - Sports
        "Taylor Swift to release new album in 2024?", // Market #6 - Pop Culture
        "Ethereum to flip Bitcoin market cap?",        // Market #7 - Crypto
        "Will AI replace 50% of jobs by 2030?",        // Market #8 - Science
        "Apple to release AR glasses in 2024?",        // Market #9 - Business
        "World Cup final to go to penalties?",         // Market #10 - Sports
    ];

    for (let i = 0; i < MARKETS.length; i++) {
        await (await market.createMarket(MARKETS[i], defaultEndTime, initialLiquidity)).wait();
        console.log(`Market #${i + 1} created: ${MARKETS[i]}`);
    }


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
