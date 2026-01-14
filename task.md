
Status: In Progress

## Todo
- [x] **Backend: Comments Module** <!-- id: 0 -->
    - [x] Switch to SQLite (Remove Docker) <!-- id: 16 -->
    - [x] Atualizar `schema.prisma` <!-- id: 1 -->
    - [x] Criar `comments.service.ts` <!-- id: 2 -->
    - [x] Criar `comments.controller.ts` <!-- id: 3 -->
    - [x] Registrar no `app.module.ts` <!-- id: 4 -->
- [x] **Frontend: Integration** <!-- id: 5 -->
    - [x] Criar `CommentsSection.tsx` <!-- id: 6 -->
    - [x] Atualizar `markets/[id]/page.tsx` (Fix + Comments) <!-- id: 7 -->
- [x] **Blockchain: Local Testing Setup** <!-- id: 8 -->
    - [x] Add Localhost to Wagmi/Privy config <!-- id: 9 -->
    - [x] Add useUSDCBalance and useMintUSDC hooks <!-- id: 10 -->
    - [x] Implement Faucet Component <!-- id: 11 -->
    - [x] Update TradingWidget to use real contract calls (localhost) <!-- id: 12 -->
    - [x] **Backend: Faucet API** (Bypass MetaMask Checks) <!-- id: 13 -->
        - [x] Create Faucet Module (Controller/Service) <!-- id: 14 -->
        - [x] Update Frontend Faucet to use API <!-- id: 15 -->
    - [x] **Setup: Stabilization** <!-- id: 17 -->
        - [x] Remove Docker dependency <!-- id: 18 -->
        - [x] Auto-install Blockchain dependencies in polybet.bat <!-- id: 19 -->
        - [x] Manual Repair (repair.bat) executed <!-- id: 20 -->
        - [x] **Fix: Contract Address Sync** (JSON Export) <!-- id: 21 -->
        - [x] **Fix: Market Data Sync** (Seed Bitcoin/Fed on Chain) <!-- id: 22 -->
    - [x] **Portfolio Improvements** <!-- id: 23 -->
        - [x] Fix "Sell" not returning funds (Add Blockchain Tx) <!-- id: 24 -->
        - [x] Show User Balance in Portfolio UI <!-- id: 25 -->
        - [x] **New: Claim Winnings** (Redeem Feature) <!-- id: 26 -->
        - [x] **UI Polish: Header Redesign** (Polymarket Style) <!-- id: 27 -->
