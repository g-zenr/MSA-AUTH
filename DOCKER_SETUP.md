# Docker Setup Guide

This guide explains how to set up and run the 1BIS API using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Application Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=mongodb://admin:password@localhost:27017/1bis_db?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Card Encoder API
=http://localhost:8080

# Better Stack Logging
BETTER_STACK_SOURCE_TOKEN=your-better-stack-source-token
BETTER_STACK_HOST=your-better-stack-host

# MongoDB Configuration (for local development)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGO_DATABASE=1bis_db
```

## Running the Application

### Production Mode

```bash
# Build and run production container
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Development Mode

```bash
# Run development container with hot reload
docker-compose --profile dev up --build

# Run in background
docker-compose --profile dev up -d --build
```

### Local Database

```bash
# Run with local MongoDB
docker-compose --profile dev --profile local-db up --build
```

### Prisma Studio

```bash
# Run Prisma Studio for database management
docker-compose --profile dev --profile prisma up --build
```

## Services

### Production Service (`app`)

- **Port**: 3000
- **Health Check**: `/api/health`
- **Features**: Production optimized build, health monitoring

### Development Service (`app-dev`)

- **Port**: 3001
- **Features**: Hot reload, volume mounting for development

### Database Service (`database`)

- **Port**: 27017
- **Features**: MongoDB 7.0 with initialization script

### Prisma Studio (`prisma-studio`)

- **Port**: 5555
- **Features**: Database management interface

### Nginx (`nginx`)

- **Ports**: 80, 443
- **Features**: Reverse proxy for production

## Health Checks

The application includes a health check endpoint at `/api/health` that returns:

- Status: "healthy"
- Timestamp
- Uptime
- Environment

## Volumes

- `./logs:/app/logs` - Application logs
- `./assets:/app/assets` - Static assets
- `mongodb_data:/data/db` - MongoDB data persistence

## Networks

All services run on the `1bis-network` bridge network for internal communication.

## Troubleshooting

### Build Issues

```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose up --build
```

### Database Connection Issues

```bash
# Check MongoDB logs
docker-compose logs database

# Reset database
docker-compose down -v
docker-compose up --build
```

### Health Check Failures

```bash
# Check application logs
docker-compose logs app

# Test health endpoint manually
curl http://localhost:3000/api/health
```

## Performance

The production service includes resource limits:

- Memory: 1GB limit, 512MB reservation
- CPU: 0.5 cores limit, 0.25 cores reservation

## Security

- Non-root user (`nodeuser`) for running the application
- Environment variables for sensitive configuration
- Health checks for monitoring
- Resource limits to prevent resource exhaustion
