
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany({ include: { positions: true } });
    console.dir(users, { depth: null });

    console.log('\n--- TRADES (Last 5) ---');
    const trades = await prisma.trade.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.dir(trades, { depth: null });

    console.log('\n--- POSITIONS ---');
    const positions = await prisma.position.findMany();
    console.dir(positions, { depth: null });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
