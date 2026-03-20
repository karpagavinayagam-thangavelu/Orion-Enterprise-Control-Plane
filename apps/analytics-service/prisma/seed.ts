import { PrismaClient } from '../src/generated-client/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Analytics Seeding...');

    const metrics = [
        { id: 'm-1', name: 'api_uptime', value: 99.99 },
        { id: 'm-2', name: 'active_users', value: 1420 },
        { id: 'm-3', name: 'error_rate', value: 0.02 },
        { id: 'm-4', name: 'request_count', value: 85000 },
    ];

    for (const metric of metrics) {
        await prisma.metric.upsert({
            where: { id: metric.id },
            update: metric,
            create: metric,
        });
    }

    const activityLogs = [
        { id: 'al-1', userId: 'u1', action: 'User Login' },
        { id: 'al-2', userId: 'u2', action: 'Created Invoice' },
        { id: 'al-3', userId: 'u1', action: 'Viewed Analytics' },
        { id: 'al-4', userId: 'u3', action: 'System Backup' },
        { id: 'al-5', userId: 'u2', action: 'Updated Profile' },
    ];

    for (const log of activityLogs) {
        await prisma.activityLog.upsert({
            where: { id: log.id },
            update: log,
            create: log,
        });
    }

    const perfData = [
        { id: 'p-1', metricName: 'latency', metricValue: 42.1 },
        { id: 'p-2', metricName: 'cpu_usage', metricValue: 8.5 },
        { id: 'p-3', metricName: 'memory_usage', metricValue: 28.9 },
    ];

    for (const perf of perfData) {
        await prisma.systemPerformance.upsert({
            where: { id: perf.id },
            update: perf,
            create: perf,
        });
    }

    console.log('Analytics Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
