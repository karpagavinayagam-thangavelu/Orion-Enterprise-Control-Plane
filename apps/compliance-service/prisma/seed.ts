import { PrismaClient } from '../src/generated-client/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Compliance Seeding...');

    const complianceChecks = [
        { id: 'cc-1', title: 'Data Privacy Policy', status: 'COMPLIANT', category: 'General' },
        { id: 'cc-2', title: 'SOC 2 Audit', status: 'PENDING', category: 'Security' },
        { id: 'cc-3', title: 'GDPR Readiness', status: 'COMPLIANT', category: 'Privacy' },
        { id: 'cc-4', title: 'HIPAA Compliance', status: 'NON_COMPLIANT', category: 'Security' },
        { id: 'cc-5', title: 'ISO 27001', status: 'COMPLIANT', category: 'Security' },
    ];

    for (const check of complianceChecks) {
        await prisma.complianceCheck.upsert({
            where: { id: check.id },
            update: check,
            create: check,
        });
    }

    const auditLogs = [
        { id: 'al-1', action: 'USER_LOGIN', user: 'admin@orion.com', status: 'SUCCESS' },
        { id: 'al-2', action: 'DATA_EXPORT', user: 'finance@orion.com', status: 'SUCCESS' },
        { id: 'al-3', action: 'POLICY_UPDATE', user: 'security@orion.com', status: 'SUCCESS' },
        { id: 'al-4', action: 'FAILED_LOGIN', user: 'unknown@hacker.com', status: 'FAILURE' },
    ];

    for (const log of auditLogs) {
        await prisma.auditLog.upsert({
            where: { id: log.id },
            update: log,
            create: log,
        });
    }

    console.log('Compliance Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
