const hre = require("hardhat");

async function main() {
    console.log("Deploying PolybetMarket...");

    // Mock Addresses for Sandbox/Testnet if mainnet addresses aren't available
    // In production, these should be the actual Gnosis CTF and USDC addresses
    const CONDITIONAL_TOKENS_ADDRESS = "0xCeAfDD6ce04303357f53AC1239148Ff6107a9C75"; // Example Amoy address
    const COLLATERAL_TOKEN_ADDRESS = "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582"; // Example Mock USDC

    const PolybetMarket = await hre.ethers.getContractFactory("PolybetMarket");
    const market = await PolybetMarket.deploy(CONDITIONAL_TOKENS_ADDRESS, COLLATERAL_TOKEN_ADDRESS);

    await market.waitForDeployment();

    console.log(`PolybetMarket deployed to: ${await market.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
