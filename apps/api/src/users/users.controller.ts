import { Controller, Post, Get, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('login')
    async login(@Body() body: { address: string }) {
        if (!body.address) {
            throw new BadRequestException('Address is required');
        }
        return this.usersService.findOrCreate(body.address);
    }

    @Get(':address/portfolio')
    async getPortfolio(@Param('address') address: string) {
        return this.usersService.getPortfolio(address);
    }
}
