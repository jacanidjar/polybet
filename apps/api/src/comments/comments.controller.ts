import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    async create(@Body() body: any) {
        // Body: { userAddress, marketId, content }
        if (!body.userAddress || !body.marketId || !body.content) {
            throw new BadRequestException('Missing fields');
        }
        return this.commentsService.create(body.userAddress, Number(body.marketId), body.content);
    }

    @Get()
    async findAll(@Query('marketId') marketId: string) {
        if (!marketId) throw new BadRequestException('Market ID required');
        return this.commentsService.findAll(Number(marketId));
    }
}
