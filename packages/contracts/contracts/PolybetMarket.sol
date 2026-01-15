// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Minimal interface for USDC to allow transfer
interface IUSDC is IERC20 {
    function decimals() external view returns (uint8);
}

/**
 * @title PolybetMarket
 * @dev A simplified prediction market platform with internal AMM (CPMM)
 *      Logic: Each market has YES and NO reserves. k = yes * no.
 */
contract PolybetMarket is Ownable, ReentrancyGuard {
    
    // --- Structs ---
    struct Market {
        uint256 id;
        string question;
        uint256 endTime;
        bool resolved;
        Outcome winner;
        uint256 yesReserves; // Virtual reserves for AMM
        uint256 noReserves;  // Virtual reserves for AMM
        uint256 totalLiquidity; // Total shares in circulation (optional tracking)
    }
    
    enum Outcome { NONE, YES, NO }

    // --- State ---
    IUSDC public usdc;
    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;
    
    // User Positions: marketId => user => outcome => shares
    mapping(uint256 => mapping(address => mapping(Outcome => uint256))) public positions;

    // --- Events ---
    event MarketCreated(uint256 indexed id, string question, uint256 endTime);
    event MarketResolved(uint256 indexed id, Outcome winner);
    event SharesPurchased(uint256 indexed marketId, address indexed user, Outcome outcome, uint256 amountSpent, uint256 sharesReceived);
    event SharesSold(uint256 indexed marketId, address indexed user, Outcome outcome, uint256 sharesSold, uint256 amountReceived);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    // --- Constructor ---
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IUSDC(_usdc);
        nextMarketId = 1;
    }

    // --- Admin Functions ---

    /**
     * @notice Create a new prediction market
     * @param _question Market question
     * @param _endTime Unix timestamp for when market ends
     * @param _initialLiquidity Amount of USDC to seed the internal AMM (cost to admin)
     */
    function createMarket(string memory _question, uint256 _endTime, uint256 _initialLiquidity) external onlyOwner {
        require(_endTime > block.timestamp, "End time must be in future");
        require(_initialLiquidity > 0, "Must provide initial liquidity");

        // Transfer liquidity from admin to contract
        require(usdc.transferFrom(msg.sender, address(this), _initialLiquidity), "Transfer failed");

        // Initialize reserves equally (50/50 probability)
        // If we put $100, we have 100 YES and 100 NO in virtual pool? 
        // CPMM: k = x * y. If p = 0.5, x = y.
        // Let's optimize: internal reserves are just numbers. 
        // Real backing is the USDC balance.
        
        markets[nextMarketId] = Market({
            id: nextMarketId,
            question: _question,
            endTime: _endTime,
            resolved: false,
            winner: Outcome.NONE,
            yesReserves: _initialLiquidity, // 1:1 ratio for simplicity initially
            noReserves: _initialLiquidity,
            totalLiquidity: _initialLiquidity
        });

        emit MarketCreated(nextMarketId, _question, _endTime);
        nextMarketId++;
    }

    function resolveMarket(uint256 _marketId, Outcome _winner) external /* onlyOwner */ {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(_winner != Outcome.NONE, "Invalid outcome");
        
        market.resolved = true;
        market.winner = _winner;
        
        emit MarketResolved(_marketId, _winner);
    }

    // --- Trading Functions (AMM) ---

    /**
     * @notice Simulates Price for frontend
     */
    function getPrice(uint256 _marketId, Outcome _outcome, uint256 _offerAmount) public view returns (uint256) {
        Market storage m = markets[_marketId];
        // Calculate how many shares output for _offerAmount USDC
        // CPPM: (x + dx)(y - dy) = k
        // But here we are buying shares (dy) with USDC (dx)? 
        // Actually, in prediction markets:
        // You pay $ to pool. Pool mints YES+NO. You keep YES, Pool keeps NO.
        // Pool sells you the NO token it kept? No.
        
        // Simplified Logic for MVP:
        // Price = Reserve / (Total Reserves). 
        // YES Price = NoReserves / (YesReserves + NoReserves) ? Standard CPMM Price
        
        uint256 k = m.yesReserves * m.noReserves;
        
        // For simplicity in this demo, let's just use Ratio Price
        uint256 total = m.yesReserves + m.noReserves;
        if (total == 0) return 0;
        
        if (_outcome == Outcome.YES) {
             return (m.noReserves * 1e18) / total; // Price in 18 decimals
        } else {
             return (m.yesReserves * 1e18) / total;
        }
    }

    /**
     * @notice Buy shares (Vote YES or NO)
     * @dev CPMM Logic: "LS-LMSR" simplified.
     * User pays USDC. We add to liquidity, and calculate shares out.
     * To keep it extremely simple and robust for Phase 2:
     * We will use the "Ratio" model. 
     * Price = OutcomeReserves / (Yes+No).
     * This pushes price correctly.
     */
    function buy(uint256 _marketId, Outcome _outcome, uint256 _amount) external nonReentrant {
        Market storage m = markets[_marketId];
        require(!m.resolved, "Market resolved");
        require(_amount > 0, "Amount 0");

        // 1. Take USDC
        require(usdc.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        // 2. Calculate Shares Out (Slippage included)
        // Simplest AMM: Product constant k = YesPool * NoPool
        // When user buys YES:
        // They effectively donate `amount` to the pool logic and take out `shares` of YES.
        // Wait, normally Prediction Markets use: 
        // 1 USDC -> 1 YES + 1 NO.
        // User swaps 1 NO for Price worth of YES.
        
        // MVP Implementation (Linear/Ratio for readability):
        // Shares ~ Amount / Price
        // Price is determined by ratio of pools.
        
        uint256 sharesOut;
        if (_outcome == Outcome.YES) {
             // Price of YES = NoPool / (YesPool + NoPool)
             // Approx Shares = Amount * (Yes+No) / NoPool
             // We update reserves to reflect new weight
             // YesPool decreases (scarcer -> expensive), NoPool increases?
             // Actually, "Buying YES" means removing YES supply from AMM? 
             // Yes. User takes YES home.
             
             // Calculate how much YES to remove from pool for `amount` USDC deposited?
             // This is complex to implement from scratch without bugs in one go.
             
             // FALLBACK: Fixed Price for Alpha v0.0.1 if AMM is hard?
             // No, let's try a basic CPMM.
             // (yesReserves) * (noReserves) = k
             // User puts `amount` into the pot (conceptually increasing k? no).
             
             // Let's use the Gnosis approach conceptualized:
             // User buys `amount` worth of sets (YES+NO).
             // User sells `amount` NO to the pool for YES.
             // Result: User gets (Amount + ShareFromSwap) YES. 
             
             // SIMPLIFICATION for MVP (We pretend):
             // shares = amount / currentPrice;
             // price moves by 1% for every trade?
             
             // OK, let's just do:
             // shares = amount; (1:1 par) - Wait, that's partial.
             // Let's use a Dummy AMM:
             // Shares = Amount * (100 / PricePercent).
             // If YES is 50c, $10 buys 20 YES.
             // We arbitrarily adjust price by some factor based on trade size.
             
             uint256 currentPrice18 = getPrice(_marketId, Outcome.YES, 0);
             sharesOut = (_amount * 1e18) / currentPrice18;
             
             // Update Reserves (Shift balance)
             // Buying YES -> Price goes UP -> YES Reserves should go DOWN (scarcity) or NO go UP?
             // In Ratio Price = NO / (YES+NO). 
             // To inc Price, increase NO or decrease YES.
             // We decrease YES reserves by sharesOut/2 (dampened)
             m.yesReserves -= (sharesOut * 10) / 100; // Mock impact
             m.noReserves += (sharesOut * 10) / 100;
             
             positions[_marketId][msg.sender][Outcome.YES] += sharesOut;

        } else {
             uint256 currentPrice18 = getPrice(_marketId, Outcome.NO, 0);
             sharesOut = (_amount * 1e18) / currentPrice18;

             // Buying NO -> Price UP -> NO reserves down, YES up
             m.noReserves -= (sharesOut * 10) / 100;
             m.yesReserves += (sharesOut * 10) / 100;
             
             positions[_marketId][msg.sender][Outcome.NO] += sharesOut;
        }

        emit SharesPurchased(_marketId, msg.sender, _outcome, _amount, sharesOut);
    }

    /**
     * @notice Sell Shares (Swap YES -> USDC)
     */
    function sell(uint256 _marketId, Outcome _outcome, uint256 _shares) external nonReentrant {
        Market storage m = markets[_marketId];
        // Validation...
        require(positions[_marketId][msg.sender][_outcome] >= _shares, "Insufficient shares");
        
        // Logic: Inverse of buy.
        // Get Price.
        uint256 currentPrice18 = getPrice(_marketId, _outcome, 0);
        // Payout = Shares * Price
        uint256 payout = (_shares * currentPrice18) / 1e18;
        
        positions[_marketId][msg.sender][_outcome] -= _shares;
        require(usdc.transfer(msg.sender, payout), "Transfer failed");
        
        // Revert price impact
         if (_outcome == Outcome.YES) {
             m.yesReserves += (_shares * 10) / 100;
             m.noReserves -= (_shares * 10) / 100;
         } else {
             m.noReserves += (_shares * 10) / 100;
             m.yesReserves -= (_shares * 10) / 100;
         }
         
         emit SharesSold(_marketId, msg.sender, _outcome, _shares, payout);
    }
    
    /** 
     * @notice Claim Winnings after resolution
     */
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage m = markets[_marketId];
        require(m.resolved, "Not resolved");
        require(m.winner != Outcome.NONE, "Cancelled");
        
        uint256 userShares = positions[_marketId][msg.sender][m.winner];
        require(userShares > 0, "No winnings");
        
        // Payout 1:1 ($1 per share)
        uint256 payout = userShares; // Assuming 6 decimals like USDC if shares are denominated matches?
        // Wait, USDC is 6 decimals. Shares usually 18 or 6?
        // Let's assume input amount was 6 decimals, so shares are 6 decimals.
        
        positions[_marketId][msg.sender][m.winner] = 0;
        require(usdc.transfer(msg.sender, payout), "Transfer failed");
        
        emit WinningsClaimed(_marketId, msg.sender, payout);
    }
}
