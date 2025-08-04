#!/bin/bash

# 1BIS API Docker Setup Script
# This script helps set up and troubleshoot the Docker environment

set -e

echo "🚀 1BIS API Docker Setup"
echo "=========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Function to check if ports are available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. Please stop the service using this port."
        return 1
    fi
    return 0
}

# Check required ports
echo "🔍 Checking port availability..."
check_port 3000 || exit 1
check_port 3001 || exit 1
check_port 27017 || exit 1
check_port 5555 || exit 1
echo "✅ All required ports are available"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Database Configuration (MongoDB)
DATABASE_URL="mongodb://admin:password@localhost:27017/1bis_db?authSource=admin"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002"
CORS_CREDENTIALS="true"

# Application Configuration
NODE_ENV="development"
PORT=3000

# MongoDB Configuration (for local Docker setup)
MONGO_ROOT_USERNAME="admin"
MONGO_ROOT_PASSWORD="password"
MONGO_DATABASE="1bis_db"

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Better Stack Logging Configuration
BETTER_STACK_SOURCE_TOKEN="your-better-stack-token"
BETTER_STACK_HOST="your-better-stack-host"

# Logging Configuration
LOG_LEVEL="info"
EOF
    echo "✅ .env file created. Please update the values as needed."
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p assets
echo "✅ Directories created"

# Function to clean up containers and images
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo "✅ Cleanup completed"
}

# Function to build images
build_images() {
    echo "🔨 Building Docker images..."
    docker-compose build --no-cache
    echo "✅ Images built successfully"
}

# Function to start development environment
start_dev() {
    echo "🚀 Starting development environment..."
    docker-compose --profile dev --profile local-db up -d
    echo "✅ Development environment started"
    echo ""
    echo "📋 Services available at:"
    echo "   - API: http://localhost:3001"
    echo "   - Prisma Studio: http://localhost:5555"
    echo "   - MongoDB: localhost:27017"
    echo ""
    echo "📝 Useful commands:"
    echo "   - View logs: docker-compose logs -f app-dev"
    echo "   - Stop services: docker-compose down"
    echo "   - Restart: docker-compose restart app-dev"
}

# Function to start production environment
start_prod() {
    echo "🚀 Starting production environment..."
    docker-compose up -d
    echo "✅ Production environment started"
    echo ""
    echo "📋 Services available at:"
    echo "   - API: http://localhost:3000"
}

# Function to show logs
show_logs() {
    echo "📋 Showing logs..."
    docker-compose logs -f
}

# Function to run database operations
db_operations() {
    echo "🗄️  Database operations..."
    echo "1. Generate Prisma client"
    docker-compose exec app-dev npx prisma generate
    echo "2. Run migrations"
    docker-compose exec app-dev npx prisma migrate dev
    echo "3. Seed database"
    docker-compose exec app-dev npx prisma db seed
    echo "✅ Database operations completed"
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    docker-compose exec app-dev npm test
}

# Function to run linting
run_lint() {
    echo "🔍 Running linting..."
    docker-compose exec app-dev npm run lint
}

# Main menu
case "${1:-}" in
    "cleanup")
        cleanup
        ;;
    "build")
        build_images
        ;;
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "logs")
        show_logs
        ;;
    "db")
        db_operations
        ;;
    "test")
        run_tests
        ;;
    "lint")
        run_lint
        ;;
    "full-setup")
        cleanup
        build_images
        start_dev
        ;;
    *)
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  cleanup     - Clean up Docker resources"
        echo "  build       - Build Docker images"
        echo "  dev         - Start development environment"
        echo "  prod        - Start production environment"
        echo "  logs        - Show container logs"
        echo "  db          - Run database operations"
        echo "  test        - Run tests"
        echo "  lint        - Run linting"
        echo "  full-setup  - Complete setup (cleanup + build + dev)"
        echo ""
        echo "Examples:"
        echo "  $0 full-setup    # Complete setup"
        echo "  $0 dev           # Start development"
        echo "  $0 logs          # View logs"
        echo ""
        ;;
esac 