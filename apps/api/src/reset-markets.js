
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting all markets to OPEN state...');

    try {
        const res = await prisma.market.updateMany({
            data: {
                resolved: false,
                outcome: null
            }
        });
        console.log('Updated count:', res.count);
        console.log('✅ All markets marked as Unresolved/Open.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
