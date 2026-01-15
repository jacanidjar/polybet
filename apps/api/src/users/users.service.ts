import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOrCreate(address: string) {
        const normalizedAddress = address.toLowerCase();

        let user = await this.prisma.user.findUnique({
            where: { address: normalizedAddress },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    address: normalizedAddress,
                    username: `User ${normalizedAddress.slice(0, 6)}...`,
                },
            });
        }

        return user;
    }

    async getPortfolio(address: string) {
        const normalizedAddress = address.toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { address: normalizedAddress },
            include: {
                positions: {
                    include: {
                        market: true
                    },
                    where: { shares: { gt: 0 } } // Only active positions
                },
                comments: {
                    include: { market: true },
                    orderBy: { createdAt: 'desc' }
                },
                trades: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { market: true }
                }
            }
        });

        if (!user) {
            // Gracefully handle new users who haven't traded yet
            return {
                address: normalizedAddress,
                positions: [],
                comments: [],
                trades: []
            };
        }

        return user;
    }

    async getLeaderboard() {
        return this.prisma.user.findMany({
            orderBy: { pnl: 'desc' },
            take: 50,
            select: {
                id: true,
                username: true,
                address: true,
                pnl: true,
                _count: {
                    select: { trades: true }
                }
            }
        });
    }
}
