#!/bin/bash

# 🔧 Fix Railway Persistence - Complete Solution
# Solves the frustrating issue of losing credentials on every deploy

set -e

echo "🚀 Railway Persistence Fix"
echo "=========================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
    echo ""
fi

echo "📊 Current Railway Project Status:"
railway status
echo ""

# Get Railway API token
echo "🔑 Railway API Token Setup"
echo "=========================="
echo ""
echo "To enable automatic persistence, we need a Railway API token:"
echo ""
echo "1. Go to: https://railway.app/account/tokens"
echo "2. Click 'Create Token'"
echo "3. Name: 'Auto Persistence'"
echo "4. Copy the token (starts with 'railway_')"
echo ""
read -p "Enter your Railway API token (or press Enter to skip automatic persistence): " RAILWAY_TOKEN

if [[ -n "$RAILWAY_TOKEN" ]]; then
    if [[ "$RAILWAY_TOKEN" =~ ^railway_ ]]; then
        echo "✅ Setting Railway API token for automatic persistence..."
        railway variables --set "RAILWAY_TOKEN=$RAILWAY_TOKEN"
        echo "✅ Automatic persistence enabled!"
    else
        echo "❌ Invalid token format. Token should start with 'railway_'"
        echo "⚠️  Continuing with manual persistence mode..."
        RAILWAY_TOKEN=""
    fi
else
    echo "⚠️  Skipping automatic persistence - will use manual mode"
fi

echo ""
echo "👤 Admin Credentials Setup"
echo "=========================="
echo ""

# Get current admin credentials
CURRENT_USERNAME=$(railway variables | grep VITE_ADMIN_USERNAME | awk -F'│' '{print $3}' | xargs || echo "admin")
CURRENT_PASSWORD=$(railway variables | grep VITE_ADMIN_PASSWORD | awk -F'│' '{print $3}' | xargs || echo "admin123")

echo "Current admin username: $CURRENT_USERNAME"
echo ""
read -p "Enter new admin username (or press Enter to keep '$CURRENT_USERNAME'): " NEW_USERNAME
NEW_USERNAME=${NEW_USERNAME:-$CURRENT_USERNAME}

read -s -p "Enter new admin password (or press Enter to keep current): " NEW_PASSWORD
echo ""
if [[ -z "$NEW_PASSWORD" ]]; then
    NEW_PASSWORD=$CURRENT_PASSWORD
fi

read -p "Enter admin email (default: admin@example.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}

# Set admin credentials
echo "🔧 Setting admin credentials..."
railway variables --set "VITE_ADMIN_USERNAME=$NEW_USERNAME"
railway variables --set "VITE_ADMIN_PASSWORD=$NEW_PASSWORD"
railway variables --set "VITE_ADMIN_EMAIL=$ADMIN_EMAIL"

echo ""
echo "🛍️ Shopify API Setup (Optional)"
echo "==============================="
echo ""
echo "For automated fee product creation, you can set Shopify API credentials:"
echo ""
read -p "Enter Shopify shop domain (e.g., your-store.myshopify.com) or press Enter to skip: " SHOPIFY_DOMAIN

if [[ -n "$SHOPIFY_DOMAIN" ]]; then
    read -p "Enter Shopify Admin API access token (starts with 'shpat_'): " SHOPIFY_TOKEN
    
    if [[ "$SHOPIFY_TOKEN" =~ ^shpat_ ]]; then
        read -p "Enter Shopify API version (default: 2024-01): " SHOPIFY_VERSION
        SHOPIFY_VERSION=${SHOPIFY_VERSION:-2024-01}
        
        echo "🔧 Setting Shopify API credentials..."
        railway variables --set "SHOPIFY_SHOP_DOMAIN=$SHOPIFY_DOMAIN"
        railway variables --set "SHOPIFY_ADMIN_ACCESS_TOKEN=$SHOPIFY_TOKEN"
        railway variables --set "SHOPIFY_API_VERSION=$SHOPIFY_VERSION"
        echo "✅ Shopify API credentials set!"
    else
        echo "❌ Invalid Shopify token format. Skipping Shopify setup."
    fi
else
    echo "⚠️  Skipping Shopify API setup"
fi

echo ""
echo "🔧 Ensuring Persistence Variables"
echo "================================="
echo ""

# Ensure persistence variables exist
echo "Setting up persistence variables..."
railway variables --set "SHOPIFY_CREDENTIALS_JSON={}"
railway variables --set "USER_DATA_JSON={}"
railway variables --set "SESSIONS_JSON={}"

echo ""
echo "🚀 Deploying with Persistence"
echo "============================="
echo ""

# Deploy the application
echo "Deploying application..."
railway up --detach

echo ""
echo "🎉 Railway Persistence Fix Complete!"
echo "===================================="
echo ""

if [[ -n "$RAILWAY_TOKEN" ]]; then
    echo "✅ AUTOMATIC PERSISTENCE ENABLED"
    echo "   - Your data will be automatically saved to Railway environment variables"
    echo "   - No manual steps required after configuration changes"
    echo "   - Check logs for '✅ Automatically updated Railway environment variable' messages"
else
    echo "⚠️  MANUAL PERSISTENCE MODE"
    echo "   - Watch Railway logs for persistence commands"
    echo "   - Copy JSON values to Railway environment variables manually"
    echo "   - Look for messages starting with '💡 To persist'"
fi

echo ""
echo "🔗 Your admin dashboard:"
railway status | grep -o 'https://[^[:space:]]*' || echo "https://delivery-schedule2-production.up.railway.app"
echo ""
echo "👤 Admin login:"
echo "   Username: $NEW_USERNAME"
echo "   Password: [set]"
echo "   Email: $ADMIN_EMAIL"
echo ""
echo "📋 Next Steps:"
echo "1. Login to your admin dashboard"
echo "2. Configure Shopify settings (if not done above)"
echo "3. Set up delivery timeslots and locations"
echo "4. Test that settings persist after redeploy"
echo ""
echo "🔍 Monitor persistence:"
echo "railway logs --follow"
echo ""
echo "🎯 Your data will now survive Railway deployments!" 