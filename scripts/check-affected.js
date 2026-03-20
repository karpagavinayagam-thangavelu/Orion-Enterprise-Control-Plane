const { execSync } = require('child_process');

// Usage: node scripts/check-affected.js [project-name]
// If project-name is omitted, tries to use VERCEL_PROJECT_NAME env var.

// Map Vercel Project Names to Nx Project Names if they differ
const PROJECT_MAPPING = {
    'orion-shell': 'shell',
    'orion-billing': 'billing',
    'orion-analytics': 'analytics',
    'orion-compliance': 'compliance',
    // Add other mappings here as needed
};

let projectName = process.argv[2] || process.env.VERCEL_PROJECT_NAME;

// Resolve mapping if exists
if (PROJECT_MAPPING[projectName]) {
    console.log(`Mapping Vercel project "${projectName}" to Nx project "${PROJECT_MAPPING[projectName]}"`);
    projectName = PROJECT_MAPPING[projectName];
}

if (!projectName) {
    console.error('Error: Project name is required. Pass as argument or set VERCEL_PROJECT_NAME.');
    process.exit(1); // Default to build if args missing
}

try {
    console.log(`Checking if project "${projectName}" is affected...`);

    // We check against HEAD~1 (last commit) by default.
    // In CI environments like Vercel/Render, this usually works for push events.
    // For PRs, you might want --base=origin/main
    const output = execSync(`npx nx show projects --affected --base=HEAD~1`, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore']
    });

    const affectedProjects = output.split('\n').map(p => p.trim()).filter(Boolean);

    console.log(`Affected projects found: ${affectedProjects.join(', ')}`);

    if (affectedProjects.includes(projectName)) {
        console.log(`✅ Project "${projectName}" is affected. PROCEEDING with build.`);
        process.exit(1); // Proceed
    } else {
        console.log(`🚫 Project "${projectName}" is NOT affected. SKIPPING build.`);
        process.exit(0); // Skip
    }
} catch (error) {
    console.error('Error checking affected projects:', error.message);
    // If something goes wrong (e.g., shallow clone), default to building to be safe
    console.log('⚠️  Error detected, defaulting to proceed with build.');
    process.exit(1);
}
