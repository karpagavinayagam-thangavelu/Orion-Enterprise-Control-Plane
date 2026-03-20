const fs = require('fs');
const path = require('path');

/**
 * This script reads environment variables from the system (Vercel, GitHub Actions, etc.)
 * and injects them into the Angular environment.prod.ts files during build time.
 */

const googleClientId = process.env.GOOGLE_CLIENT_ID || '300108406670-3vs26d0d09i5gbg3jej6f30d5ipsm21t.apps.googleusercontent.com';
const apiUrl = process.env.API_URL || 'https://orion-api-gateway.onrender.com/graphql';
const wsUrl = process.env.WS_URL || process.env.NOTIFICATION_URL || 'https://orion-notification-service.onrender.com';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  wsUrl: '${wsUrl}',
  googleClientId: '${googleClientId}'
};
`;

// Targeted environment files
const targetPaths = [
    'apps/shell/src/environments/environment.prod.ts',
    'apps/billing/src/environments/environment.prod.ts',
    'apps/analytics/src/environments/environment.prod.ts',
    'apps/compliance/src/environments/environment.prod.ts'
];

console.log('--- Generating Production Environment Files ---');

targetPaths.forEach((targetPath) => {
    const fullPath = path.resolve(__dirname, '..', targetPath);

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, envConfigFile);
    console.log(`✅ Generated: ${targetPath}`);
});

// Generate Production Module Federation Manifest
// Generate Production Module Federation Manifest
const billingUrl = process.env.REMOTES_BILLING_URL || 'https://orion-billing.vercel.app';
const analyticsUrl = process.env.REMOTES_ANALYTICS_URL || 'https://orion-analytics.vercel.app';
const complianceUrl = process.env.REMOTES_COMPLIANCE_URL || 'https://orion-compliance.vercel.app';

const manifest = {
    billing: `${billingUrl}/mf-manifest.json`,
    analytics: `${analyticsUrl}/mf-manifest.json`,
    compliance: `${complianceUrl}/mf-manifest.json`
};

const manifestPath = path.resolve(__dirname, '..', 'apps/shell/public/module-federation.manifest.json');
// Ensure directory exists for public assets if strict
const manifestDir = path.dirname(manifestPath);
if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated: apps/shell/public/module-federation.manifest.json`);

console.log('-----------------------------------------------');
