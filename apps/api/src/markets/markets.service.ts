import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketsService {
    constructor(private prisma: PrismaService) { }

    async findAll(category?: string) {
        const where = category && category !== 'All' ? { category } : {};
        return this.prisma.market.findMany({
            where,
            orderBy: { volume: 'desc' }
        });
    }

    async findOne(id: number) {
        return this.prisma.market.findUnique({
            where: { id },
            include: {
                trades: {
                    orderBy: { createdAt: 'asc' } // History for chart
                }
            }
        });
    }

    async seed() {
        const MOCK_MARKETS = [
            { question: "Will Trump win the 2024 Election?", volume: 12500000, chance: 45, category: "Politics" },
            { question: "Bitcoin to hit $100k in 2024?", volume: 8200000, chance: 12, category: "Crypto" },
            { question: "Fed to cut rates in March?", volume: 5100000, chance: 78, category: "Business" },
            { question: "SpaceX Starship launch successful?", volume: 2300000, chance: 92, category: "Science" },
            { question: "Lakers to win NBA Championship?", volume: 4700000, chance: 23, category: "Sports" },
            { question: "Taylor Swift to release new album in 2024?", volume: 1800000, chance: 67, category: "Pop Culture" },
        ];

        for (const m of MOCK_MARKETS) {
            // Check if exists
            const exists = await this.prisma.market.findFirst({ where: { question: m.question } });
            if (!exists) {
                await this.prisma.market.create({
                    data: {
                        question: m.question,
                        volume: m.volume,
                        chance: m.chance,
                        category: m.category,
                        slug: m.question.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    }
                });
            }
        }
        return { message: 'Seeded successfully' };
    }
}
