import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async create(userAddress: string, marketId: number, content: string) {
        if (!content) throw new BadRequestException('Content is required');

        // Ensure user exists
        const user = await this.usersService.findOrCreate(userAddress);

        return this.prisma.comment.create({
            data: {
                content,
                userId: user.id,
                marketId,
            },
            include: {
                user: true
            }
        });
    }

    async findAll(marketId: number) {
        return this.prisma.comment.findMany({
            where: { marketId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: true
            }
        });
    }
}
