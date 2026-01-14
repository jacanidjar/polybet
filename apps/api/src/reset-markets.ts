
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting all markets to OPEN state...');

    await prisma.market.updateMany({
        data: {
            resolved: false,
            outcome: null
        }
    });

    console.log('✅ All markets marked as Unresolved/Open.');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
