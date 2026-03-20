import { PrismaClient } from '@orion/auth-service-client';

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            name: 'Orion Admin',
            email: 'admin@orion.com',
            passwordHash: 'admin123', // In a real app, use bcrypt
            roles: 'ADMIN',
            permissions: 'VIEW_BILLING,VIEW_ANALYTICS,VIEW_COMPLIANCE',
        },
        {
            name: 'Finance User',
            email: 'finance@orion.com',
            passwordHash: 'finance123',
            roles: 'FINANCE',
            permissions: 'VIEW_BILLING',
        },
        {
            name: 'Manager User',
            email: 'manager@orion.com',
            passwordHash: 'manager123',
            roles: 'MANAGER',
            permissions: 'VIEW_ANALYTICS',
        },
    ];

    for (const user of users) {
        await prisma.authUser.upsert({
            where: { email: user.email },
            update: {},
            create: user,
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
