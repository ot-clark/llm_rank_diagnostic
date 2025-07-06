#!/bin/bash

echo "🚀 Starting LLM Rank Diagnostic Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    echo "Required variables:"
    echo "  - DATABASE_URL"
    echo "  - REDIS_URL" 
    echo "  - OPENAI_API_KEY"
    exit 1
fi

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start it first."
    exit 1
fi

# Check if Redis is running
echo "🔴 Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start it first."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm run install:all

# Setup database if needed
echo "🗄️ Setting up database..."
npm run setup:db

# Start all services
echo "🌟 Starting all services..."
npm run dev:all 