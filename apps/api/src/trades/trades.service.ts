import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateTradeDto {
    userId: string;
    marketId: number;
    outcome: 'YES' | 'NO';
    amount: number;
    type: 'BUY' | 'SELL';
    price: number; // In a real app, this should be calculated on server
}

@Injectable()
export class TradesService {
    constructor(private prisma: PrismaService) { }

    async createTrade(dto: CreateTradeDto) {
        const market = await this.prisma.market.findUnique({
            where: { id: dto.marketId },
        });

        if (!market) throw new NotFoundException('Market not found');

        const amountDecimal = dto.amount;
        const shares = dto.amount / dto.price;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Trade Record
            const trade = await tx.trade.create({
                data: {
                    userId: dto.userId,
                    marketId: dto.marketId,
                    type: dto.type,
                    outcome: dto.outcome,
                    amount: amountDecimal,
                    price: dto.price,
                    shares: shares,
                },
            });

            // 2. Update Position
            const existingPosition = await tx.position.findUnique({
                where: {
                    userId_marketId_outcome: {
                        userId: dto.userId,
                        marketId: dto.marketId,
                        outcome: dto.outcome,
                    },
                },
            });

            if (dto.type === 'SELL') {
                if (!existingPosition || Number(existingPosition.shares) < shares) {
                    throw new BadRequestException('Insufficient shares to sell');
                }

                // SELL: Decrement shares, AvgPrice stays same
                const newShares = Number(existingPosition.shares) - shares;

                if (newShares > 0) {
                    await tx.position.update({
                        where: { id: existingPosition.id },
                        data: { shares: newShares }
                    });
                } else {
                    // Fully closed
                    await tx.position.delete({
                        where: { id: existingPosition.id }
                    });
                }
            } else {
                // BUY: Increment shares, Update AvgPrice
                if (existingPosition) {
                    const totalShares = Number(existingPosition.shares) + shares;
                    const currentCost = Number(existingPosition.shares) * existingPosition.avgPrice;
                    const newCost = dto.amount; // Cost of this buy
                    const newAvgPrice = (currentCost + newCost) / totalShares;

                    await tx.position.update({
                        where: { id: existingPosition.id },
                        data: {
                            shares: totalShares,
                            avgPrice: newAvgPrice
                        }
                    });
                } else {
                    await tx.position.create({
                        data: {
                            userId: dto.userId,
                            marketId: dto.marketId,
                            outcome: dto.outcome,
                            shares: shares,
                            avgPrice: dto.price
                        }
                    });
                }
            }

            // 3. Update Market Volume
            await tx.market.update({
                where: { id: dto.marketId },
                data: {
                    volume: { increment: amountDecimal }
                }
            });

            return trade;
        });
    }

    async findAll(marketId?: number) {
        return this.prisma.trade.findMany({
            where: marketId ? { marketId } : undefined,
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                market: true,
            },
        });
    }
}
