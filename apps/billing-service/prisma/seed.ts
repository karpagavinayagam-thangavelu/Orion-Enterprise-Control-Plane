import { PrismaClient } from '../src/generated-client/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Billing Seeding...');

    const transactions = [
        { id: 'tx-1', customerId: 'c1', customerName: 'Enterprise Corp 1', amount: 12000, status: 'PAID', date: new Date('2026-01-10') },
        { id: 'tx-2', customerId: 'c2', customerName: 'Nexus Systems', amount: 8500, status: 'PAID', date: new Date('2026-01-15') },
        { id: 'tx-3', customerId: 'c3', customerName: 'Stellar Dynamics', amount: 15700, status: 'PAID', date: new Date('2026-01-20') },
        { id: 'tx-4', customerId: 'c4', customerName: 'Global Tech', amount: 9200, status: 'PAID', date: new Date('2026-02-01') },
        { id: 'tx-5', customerId: 'c5', customerName: 'Future Solutions', amount: 11000, status: 'PAID', date: new Date('2026-02-05') },
        { id: 'tx-6', customerId: 'c1', customerName: 'Enterprise Corp 1', amount: 5000, status: 'PENDING', date: new Date() },
        { id: 'tx-7', customerId: 'c2', customerName: 'Nexus Systems', amount: 3200, status: 'PENDING', date: new Date() },
    ];

    for (const t of transactions) {
        await prisma.transaction.upsert({
            where: { id: t.id },
            update: t,
            create: t,
        });
    }

    const invoices = [
        { id: 'inv-1', customerId: 'c1', amount: 5000, status: 'PENDING', dueDate: new Date('2026-03-01') },
        { id: 'inv-2', customerId: 'c2', amount: 3200, status: 'PENDING', dueDate: new Date('2026-03-15') },
        { id: 'inv-3', customerId: 'c3', amount: 0, status: 'PAID', dueDate: new Date('2026-01-20'), createdAt: new Date('2026-01-10') },
    ];

    for (const i of invoices) {
        await prisma.invoice.upsert({
            where: { id: i.id },
            update: i,
            create: i,
        });
    }

    console.log('Billing Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
