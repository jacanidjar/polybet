
import { Controller, Post, Body } from '@nestjs/common';
import { FaucetService } from './faucet.service';

@Controller('faucet')
export class FaucetController {
    constructor(private readonly faucetService: FaucetService) { }

    @Post('gas')
    async fundGas(@Body('address') address: string) {
        return this.faucetService.fundGas(address);
    }
}
