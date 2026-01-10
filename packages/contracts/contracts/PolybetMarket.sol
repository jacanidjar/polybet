// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Interface for Conditional Tokens (assuming package install works, otherwise we need interface)
interface IConditionalTokens {
    function splitPosition(
        IERC20 collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint[] calldata partition,
        uint amount
    ) external;
    function mergePositions(
        IERC20 collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint[] calldata partition,
        uint amount
    ) external;
    function reportPayouts(bytes32 questionId, uint[] calldata payouts) external;
}

contract PolybetMarket {
    IConditionalTokens public conditionalTokens;
    IERC20 public collateralToken;

    constructor(address _conditionalTokens, address _collateralToken) {
        conditionalTokens = IConditionalTokens(_conditionalTokens);
        collateralToken = IERC20(_collateralToken);
    }

    // Basic buy wrapper
    function buyShares(
        bytes32 conditionId,
        uint[] calldata indexSets,
        uint amount
    ) external {
        // Take collateral from user
        collateralToken.transferFrom(msg.sender, address(this), amount);
        
        // Approve CTF to spend collateral
        collateralToken.approve(address(conditionalTokens), amount);

        // Split collateral into positions (mint outcome tokens)
        conditionalTokens.splitPosition(
            collateralToken,
            bytes32(0),
            conditionId,
            indexSets,
            amount
        );
        
        // Logic to distribute shares to user would happen here or via the CTF directly if msg.sender was passed
        // Note: CTF mints to the caller (this contract). We need to transfer them to the user.
        // For simplicity in this step, we assume this contract manages the liquidity.
    }
}
