const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    // 1. Deploy Mock USDC
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

    // 3. Setup Initial State (Optional)
    // Approve Market to spend admin's USDC?
    // Create a test market?

    console.log("Deployment complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
