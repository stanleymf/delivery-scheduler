#!/bin/bash

# Delivery Scheduler Deployment Script
# This script deploys both the admin dashboard and customer widget

set -e  # Exit on any error

echo "🚀 Starting Delivery Scheduler Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        print_warning "wrangler is not installed. Installing..."
        npm install -g wrangler
    fi
    
    print_success "Dependencies check completed"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Clean previous builds
    rm -rf dist/
    
    # Install dependencies
    pnpm install
    
    # Build both admin dashboard and widget
    pnpm build:all
    
    print_success "Build completed"
}

# Deploy admin dashboard to Railway
deploy_admin() {
    print_status "Deploying admin dashboard to Railway..."
    
    if command -v railway &> /dev/null; then
        railway up
        print_success "Admin dashboard deployed to Railway"
    else
        print_warning "Railway CLI not found. Please deploy manually:"
        print_warning "1. Install Railway CLI: npm install -g @railway/cli"
        print_warning "2. Login: railway login"
        print_warning "3. Deploy: railway up"
    fi
}

# Deploy widget to Cloudflare Workers
deploy_widget() {
    print_status "Deploying customer widget to Cloudflare Workers..."
    
    # Check if wrangler is logged in
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged in to Cloudflare. Please login:"
        wrangler login
    fi
    
    # Deploy to production
    wrangler deploy
    
    print_success "Customer widget deployed to Cloudflare Workers"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Get worker URL
    WORKER_URL=$(wrangler whoami 2>/dev/null | grep -o 'https://[^/]*\.workers\.dev' || echo "https://delivery-scheduler-widget.workers.dev")
    
    print_status "Testing health endpoint..."
    if curl -s "$WORKER_URL/health" | grep -q "ok"; then
        print_success "Health check passed"
    else
        print_warning "Health check failed - check worker logs"
    fi
    
    print_status "Testing widget endpoint..."
    if curl -s "$WORKER_URL/widget.js" | grep -q "Delivery Scheduler Widget"; then
        print_success "Widget endpoint working"
    else
        print_warning "Widget endpoint failed - check worker logs"
    fi
}

# Main deployment function
main() {
    local deploy_admin_flag=false
    local deploy_widget_flag=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --admin-only)
                deploy_admin_flag=true
                shift
                ;;
            --widget-only)
                deploy_widget_flag=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --admin-only    Deploy only the admin dashboard"
                echo "  --widget-only   Deploy only the customer widget"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # If no specific flags, deploy both
    if [[ "$deploy_admin_flag" == false && "$deploy_widget_flag" == false ]]; then
        deploy_admin_flag=true
        deploy_widget_flag=true
    fi
    
    # Start deployment
    check_dependencies
    build_app
    
    if [[ "$deploy_admin_flag" == true ]]; then
        deploy_admin
    fi
    
    if [[ "$deploy_widget_flag" == true ]]; then
        deploy_widget
    fi
    
    test_deployment
    
    print_success "Deployment completed successfully!"
    
    # Show next steps
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure Shopify webhooks"
    echo "2. Add widget to your Shopify theme"
    echo "3. Test the complete flow"
    echo ""
    echo "📚 Documentation: docs/DEPLOYMENT.md"
}

# Run main function with all arguments
main "$@" 