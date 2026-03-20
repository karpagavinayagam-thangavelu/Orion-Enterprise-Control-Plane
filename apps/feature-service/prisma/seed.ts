import { PrismaClient } from '@orion/feature-service-client';

const prisma = new PrismaClient();

async function main() {
    const flags = [
        { name: 'new-dashboard', enabled: true, description: 'Enables the new shell dashboard' },
        { name: 'dark-mode', enabled: true, description: 'Enables global dark mode' },
        { name: 'beta-analytics', enabled: false, description: 'Enables experimental analytics features' },
    ];

    for (const flag of flags) {
        await prisma.featureFlag.upsert({
            where: { name: flag.name },
            update: {},
            create: flag,
        });
    }

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
