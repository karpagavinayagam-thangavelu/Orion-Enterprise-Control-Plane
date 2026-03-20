#!/bin/bash

echo "Starting Vercel Build..."

# 1. Run environment injection (updates environment.prod.ts and manifests in public/)
node scripts/inject-env.js

# 2. Run the actual build
npx nx build shell --prod

# 3. FORCE overwrite the manifest in the output directory, just in case the build messed it up
echo "Forcing overwrite of module-federation.manifest.json in dist..."
cp apps/shell/public/module-federation.manifest.json dist/apps/shell/module-federation.manifest.json

echo "Build Complete!"
