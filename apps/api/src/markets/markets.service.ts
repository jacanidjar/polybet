import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.market.create({
            data: {
                id: data.id, // Explicitly set ID from Blockchain
                slug: data.slug,
                question: data.question,
                description: data.description,
                category: data.category,
                endDate: new Date(data.endDate),
                image: data.image,
                chance: 50, // Initial chance
                volume: 0,
            }
        });
    }

    async findAll(category?: string, search?: string, sort?: string) {
        const where: any = {};

        if (category && category !== 'All') {
            where.category = category;
        }

        if (search) {
            where.question = { contains: search }; // Case insensitive usually depends on DB collation
        }

        let orderBy: any = { volume: 'desc' }; // Default

        switch (sort) {
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'ending':
                orderBy = { endDate: 'asc' };
                break;
            case 'liquidity':
            case 'volume':
                orderBy = { volume: 'desc' };
                break;
            // Add 'chance' or others if needed
        }

        return this.prisma.market.findMany({
            where,
            orderBy
        });
    }

    async findOne(idOrSlug: string | number) {
        // Try to find by ID if it looks like a number
        if (!isNaN(Number(idOrSlug))) {
            const market = await this.prisma.market.findUnique({
                where: { id: Number(idOrSlug) },
                include: {
                    trades: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
            if (market) return market;
        }

        // Verify if it's a slug
        return this.prisma.market.findUnique({
            where: { slug: String(idOrSlug) },
            include: {
                trades: {
                    orderBy: { createdAt: 'asc' }
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
            { question: "Ethereum to flip Bitcoin market cap?", volume: 3500000, chance: 8, category: "Crypto" },
            { question: "Will AI replace 50% of jobs by 2030?", volume: 6200000, chance: 35, category: "Science" },
            { question: "Apple to release AR glasses in 2024?", volume: 2900000, chance: 42, category: "Business" },
            { question: "World Cup final to go to penalties?", volume: 1200000, chance: 28, category: "Sports" },
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

    async resolveMarket(id: number, winner: string) {
        return this.prisma.market.update({
            where: { id },
            data: {
                resolved: true,
                outcome: winner
            }
        });
    }

    async resetAll() {
        // Reset all markets to open state
        await this.prisma.market.updateMany({
            data: {
                resolved: false,
                outcome: null
            }
        });
        return { message: 'All markets reset to OPEN' };
    }
}
