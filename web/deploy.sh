#!/bin/bash
# Graded web app deploy script
# Deploys to Vercel production and updates all domain aliases
# Usage: ./deploy.sh

set -e

echo "Deploying Graded web app to production..."

# Deploy and capture the deployment URL
DEPLOY_URL=$(npx vercel --prod 2>&1 | grep -oE 'https://graded-[a-z0-9]+-rjs-projects-[a-z0-9]+\.vercel\.app' | head -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "ERROR: Could not extract deployment URL. Deploy may have failed."
  npx vercel --prod
  exit 1
fi

echo ""
echo "Deployment URL: $DEPLOY_URL"
echo ""
echo "Setting domain aliases..."

# Set all three aliases to point to the new deployment
npx vercel alias set "$DEPLOY_URL" getgraded.vercel.app
npx vercel alias set "$DEPLOY_URL" graded-ai.vercel.app
npx vercel alias set "$DEPLOY_URL" graded-app.vercel.app

echo ""
echo "Verifying..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://getgraded.vercel.app)
PITCH_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://getgraded.vercel.app/pitch)

echo "  getgraded.vercel.app      → $HTTP_CODE"
echo "  getgraded.vercel.app/pitch → $PITCH_CODE"

if [ "$HTTP_CODE" = "200" ] && [ "$PITCH_CODE" = "200" ]; then
  echo ""
  echo "✅ Deploy complete. All aliases updated and verified."
else
  echo ""
  echo "⚠️  Deploy completed but verification failed. Check URLs manually."
fi
