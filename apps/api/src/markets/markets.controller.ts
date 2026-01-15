import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { MarketsService } from './markets.service';

@Controller('markets')
export class MarketsController {
    constructor(private readonly marketsService: MarketsService) { }

    @Get()
    findAll(
        @Query('category') category?: string,
        @Query('search') search?: string,
        @Query('sort') sort?: string
    ) {
        return this.marketsService.findAll(category, search, sort);
    }

    @Post()
    async createMarket(@Body() body: any) {
        return this.marketsService.create(body);
    }

    @Get(':id')
    async getMarket(@Param('id') id: string) {
        return this.marketsService.findOne(id);
    }

    // Endpoint temporário para popular dados
    @Post('seed')
    async seed() {
        return this.marketsService.seed();
    }

    @Get('debug/reset-all')
    async resetAll() {
        return this.marketsService.resetAll();
    }

    // Resolve market (sync blockchain -> backend)
    @Patch(':id/resolve')
    async resolveMarket(@Param('id') id: string, @Body() body: { resolved: boolean; winner: string }) {
        return this.marketsService.resolveMarket(Number(id), body.winner);
    }
}
