
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Clearing all Phantom Positions and Trades...');

    try {
        // Delete all positions
        const positions = await prisma.position.deleteMany({});
        console.log(`✅ Deleted ${positions.count} positions.`);

        // Delete all trades
        const trades = await prisma.trade.deleteMany({});
        console.log(`✅ Deleted ${trades.count} trades.`);

        console.log('\n✨ Database is now clean and synced with the fresh Blockchain.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
