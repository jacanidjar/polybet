import { Controller, Post, Body, BadRequestException, Get, Query } from '@nestjs/common';
import { TradesService } from './trades.service';
import { UsersService } from '../users/users.service';

@Controller('trades')
export class TradesController {
    constructor(
        private readonly tradesService: TradesService,
        private readonly usersService: UsersService,
    ) { }

    @Post()
    async create(@Body() body: any) {
        // Frontend sends: { userId, marketId, outcome, amount, type, price }
        let userId = body.userId;

        if (!userId && body.userAddress) {
            const user = await this.usersService.findOrCreate(body.userAddress);
            userId = user.id;
        }

        if (!userId || !body.marketId || !body.amount) {
            throw new BadRequestException('Missing required fields (userId, marketId, amount)');
        }

        return this.tradesService.createTrade({
            userId: userId,
            marketId: Number(body.marketId),
            outcome: body.outcome.toUpperCase(),
            amount: Number(body.amount),
            type: body.type.toUpperCase(),
            price: Number(body.price) || 0.5
        });
    }

    @Get()
    async findAll(@Query('marketId') marketId?: string) {
        return this.tradesService.findAll(marketId ? Number(marketId) : undefined);
    }
}
