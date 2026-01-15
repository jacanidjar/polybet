
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class FaucetService {
    // Hardhat Account #0
    private privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    private provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    private wallet = new ethers.Wallet(this.privateKey, this.provider);

    async fundGas(address: string) {
        console.log(`[Faucet] Sending 1 ETH to ${address}...`);

        const tx = await this.wallet.sendTransaction({
            to: address,
            value: ethers.parseEther("1.0")
        });

        console.log(`[Faucet] Sent! Tx: ${tx.hash}`);
        return { success: true, txHash: tx.hash };
    }
}
