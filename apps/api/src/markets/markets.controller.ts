import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MarketsService } from './markets.service';

@Controller('markets')
export class MarketsController {
    constructor(private readonly marketsService: MarketsService) { }

    @Get()
    findAll(@Query('category') category?: string) {
        return this.marketsService.findAll(category);
    }

    @Get(':id')
    async getMarket(@Param('id') id: string) {
        return this.marketsService.findOne(Number(id));
    }

    // Endpoint temporário para popular dados
    @Post('seed')
    async seed() {
        return this.marketsService.seed();
    }
}
