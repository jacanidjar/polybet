import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateTradeDto {
    userId: string;
    marketId: number;
    outcome: 'YES' | 'NO';
    amount: number;
    type: 'BUY' | 'SELL' | 'CLAIM';
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
        // For CLAIM, price/shares logic is different (usually total payout) but we can accept 0
        const shares = dto.type === 'CLAIM' ? 0 : dto.amount / dto.price;

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

            if (dto.type === 'CLAIM') {
                if (existingPosition) {
                    // CLAIM: Win $1.00 per share.
                    // PnL = (1.00 - AvgPrice) * Shares
                    const profit = (1.0 - existingPosition.avgPrice) * Number(existingPosition.shares);

                    await tx.user.update({
                        where: { id: dto.userId },
                        data: { pnl: { increment: profit } }
                    });

                    await tx.position.delete({
                        where: { id: existingPosition.id }
                    });
                }
            } else if (dto.type === 'SELL') {
                if (!existingPosition || Number(existingPosition.shares) < shares) {
                    throw new BadRequestException('Insufficient shares to sell');
                }

                // SELL: Realized PnL = (SellPrice - AvgPrice) * Shares
                const profit = (dto.price - existingPosition.avgPrice) * shares;

                await tx.user.update({
                    where: { id: dto.userId },
                    data: { pnl: { increment: profit } }
                });

                const newShares = Number(existingPosition.shares) - shares;

                if (newShares > 0) {
                    await tx.position.update({
                        where: { id: existingPosition.id },
                        data: { shares: newShares }
                    });
                } else {
                    await tx.position.delete({
                        where: { id: existingPosition.id }
                    });
                }
            } else {
                // BUY: No PnL impact yet (Unrealized)
                if (existingPosition) {
                    const totalShares = Number(existingPosition.shares) + shares;
                    const currentCost = Number(existingPosition.shares) * existingPosition.avgPrice;
                    const newCost = dto.amount;
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

            // 4. Record Price History
            // We record the price of the outcome that was traded.
            // Ideally we'd record both YES and NO prices, but for now we record the traded one.
            await tx.marketHistory.create({
                data: {
                    marketId: dto.marketId,
                    outcome: dto.outcome,
                    price: dto.price,
                }
            });

            return trade;
        });
    }

    async findAll(marketId?: number, userId?: string) {
        return this.prisma.trade.findMany({
            where: {
                ...(marketId ? { marketId } : {}),
                ...(userId ? { userId } : {}),
            },
            take: 1000, // Increased limit for history
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                market: true,
            },
        });
    }
}
