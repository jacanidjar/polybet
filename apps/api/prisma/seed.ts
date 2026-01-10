
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Users
    const user1 = await prisma.user.create({
        data: {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            username: 'CryptoKing',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
            username: 'BetMaster',
        },
    });

    // Create Markets
    await prisma.market.create({
        data: {
            question: 'Bitcoin to hit $100k by 2024?',
            slug: 'btc-100k-2024',
            category: 'Crypto',
            description: 'Will Bitcoin price exceed $100,000 USD before January 1st, 2025?',
            image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
            chance: 45.5,
            volume: 1250000.50,
            endDate: new Date('2024-12-31T23:59:59Z'),
        },
    });

    await prisma.market.create({
        data: {
            question: 'Fed to cut rates in March?',
            slug: 'fed-cut-march',
            category: 'Business',
            description: 'Will the Federal Reserve announce a rate cut in their March meeting?',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Seal_of_the_United_States_Federal_Reserve_System.svg/1200px-Seal_of_the_United_States_Federal_Reserve_System.svg.png',
            chance: 20.0,
            volume: 500000.00,
            endDate: new Date('2024-03-31T23:59:59Z'),
        },
    });

    // Create dummy trades for Activity Feed
    await prisma.trade.create({
        data: {
            type: 'BUY',
            outcome: 'YES',
            amount: 50.00,
            price: 0.45,
            shares: 111.11,
            userId: user1.id,
            marketId: 1, // Assuming auto-increment starts at 1
        },
    });

    await prisma.trade.create({
        data: {
            type: 'SELL',
            outcome: 'NO',
            amount: 100.00,
            price: 0.55,
            shares: 181.81,
            userId: user2.id,
            marketId: 1,
        },
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
