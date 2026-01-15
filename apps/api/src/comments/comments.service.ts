import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async create(userAddress: string, marketId: number, content: string, parentId?: string) {
        if (!content) throw new BadRequestException('Content is required');

        // Ensure user exists
        const user = await this.usersService.findOrCreate(userAddress);

        return this.prisma.comment.create({
            data: {
                content,
                userId: user.id,
                marketId,
                parentId
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
                user: true,
                likes: true,
                replies: {
                    include: {
                        user: true,
                        likes: true
                    }
                }
            }
        });
    }

    async toggleLike(userAddress: string, commentId: string) {
        const user = await this.usersService.findOrCreate(userAddress);

        const existingLike = await this.prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: user.id,
                    commentId
                }
            }
        });

        if (existingLike) {
            await this.prisma.commentLike.delete({
                where: { id: existingLike.id }
            });
            return { liked: false };
        } else {
            await this.prisma.commentLike.create({
                data: {
                    userId: user.id,
                    commentId
                }
            });
            return { liked: true };
        }
    }
}
