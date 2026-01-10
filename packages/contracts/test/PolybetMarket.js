const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolybetMarket", function () {
    it("Should deploy successfully", async function () {
        const [owner] = await ethers.getSigners();

        // Mock addresses for CTF and Collateral for now
        const mockCTF = owner.address;
        const mockCollateral = owner.address;

        const PolybetMarket = await ethers.getContractFactory("PolybetMarket");
        const market = await PolybetMarket.deploy(mockCTF, mockCollateral);

        expect(await market.collateralToken()).to.equal(mockCollateral);
    });
});
