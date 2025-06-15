#!/bin/bash

# 🔧 Railway Persistence Setup Script
# Automates the setup of persistent data storage for Railway deployments

set -e

echo "🚀 Railway Persistence Setup"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
fi

# Get project information
echo "📊 Getting project information..."
PROJECT_INFO=$(railway status 2>/dev/null || echo "")

if [[ -z "$PROJECT_INFO" ]]; then
    echo "❌ No Railway project linked. Please run 'railway link' first."
    exit 1
fi

# Extract project and environment IDs
PROJECT_ID=$(echo "$PROJECT_INFO" | grep -o 'Project:.*(' | sed 's/Project:.* (//' | sed 's/)//')
ENVIRONMENT_ID=$(echo "$PROJECT_INFO" | grep -o 'Environment:.*(' | sed 's/Environment:.* (//' | sed 's/)//')

if [[ -z "$PROJECT_ID" || -z "$ENVIRONMENT_ID" ]]; then
    echo "❌ Could not extract project/environment IDs. Please check 'railway status' output."
    exit 1
fi

echo "✅ Found project ID: $PROJECT_ID"
echo "✅ Found environment ID: $ENVIRONMENT_ID"

# Prompt for Railway API token
echo ""
echo "🔑 Railway API Token Setup"
echo "1. Go to Railway Dashboard → Profile → Account Settings"
echo "2. Click 'Tokens' tab → 'Create Token'"
echo "3. Name: 'Auto Persistence'"
echo "4. Copy the token (starts with 'railway_')"
echo ""
read -p "Enter your Railway API token: " RAILWAY_TOKEN

if [[ ! "$RAILWAY_TOKEN" =~ ^railway_ ]]; then
    echo "❌ Invalid token format. Token should start with 'railway_'"
    exit 1
fi

# Prompt for admin credentials
echo ""
echo "👤 Admin Credentials Setup"
read -p "Enter admin username (default: admin): " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

read -s -p "Enter admin password (default: admin123): " ADMIN_PASSWORD
echo ""
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

read -p "Enter admin email (default: admin@example.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}

# Prompt for Shopify credentials
echo ""
echo "🛍️ Shopify API Credentials Setup"
read -p "Enter Shopify shop domain (e.g., your-store.myshopify.com): " SHOPIFY_DOMAIN
read -p "Enter Shopify Admin API access token (starts with 'shpat_'): " SHOPIFY_TOKEN

if [[ ! "$SHOPIFY_TOKEN" =~ ^shpat_ ]]; then
    echo "❌ Invalid Shopify token format. Token should start with 'shpat_'"
    exit 1
fi

read -p "Enter Shopify API version (default: 2024-01): " SHOPIFY_VERSION
SHOPIFY_VERSION=${SHOPIFY_VERSION:-2024-01}

# Set all environment variables
echo ""
echo "🔧 Setting Railway environment variables..."

# Railway API credentials for automatic persistence
railway variables set RAILWAY_TOKEN="$RAILWAY_TOKEN"
railway variables set RAILWAY_PROJECT_ID="$PROJECT_ID"
railway variables set RAILWAY_ENVIRONMENT_ID="$ENVIRONMENT_ID"

# Admin credentials
railway variables set VITE_ADMIN_USERNAME="$ADMIN_USERNAME"
railway variables set VITE_ADMIN_PASSWORD="$ADMIN_PASSWORD"
railway variables set VITE_ADMIN_EMAIL="$ADMIN_EMAIL"

# Shopify API credentials
railway variables set SHOPIFY_SHOP_DOMAIN="$SHOPIFY_DOMAIN"
railway variables set SHOPIFY_ADMIN_ACCESS_TOKEN="$SHOPIFY_TOKEN"
railway variables set SHOPIFY_API_VERSION="$SHOPIFY_VERSION"

# Initialize empty persistence variables
railway variables set SHOPIFY_CREDENTIALS_JSON="{}"
railway variables set USER_DATA_JSON="{}"
railway variables set SESSIONS_JSON="{}"

echo "✅ All environment variables set successfully!"

# Deploy the application
echo ""
echo "🚀 Deploying application with persistence..."
railway up

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "✅ Automatic persistence is now enabled"
echo "✅ Admin credentials: $ADMIN_USERNAME / [password set]"
echo "✅ Shopify API configured for: $SHOPIFY_DOMAIN"
echo ""
echo "🔗 Your admin dashboard will be available at:"
railway status | grep -o 'https://[^[:space:]]*'
echo ""
echo "📋 Next steps:"
echo "1. Login to your admin dashboard"
echo "2. Configure delivery settings"
echo "3. Test Shopify connection"
echo "4. Verify data persists after redeploy"
echo ""
echo "🔍 Monitor Railway logs to see automatic persistence in action:"
echo "railway logs"
echo ""
echo "🎯 Your data will now survive all Railway deployments!" 