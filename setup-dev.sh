#!/bin/bash

# RTA Camera Management - Development Setup Script

echo "🚀 Starting RTA Camera Management System..."

# Check if we're in the correct directory
if [ ! -f "requirements.txt" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the rta_cma project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python
if ! command_exists python && ! command_exists python3; then
    echo "❌ Error: Python is not installed"
    exit 1
fi

# Check Node.js
if ! command_exists node; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check npm
if ! command_exists npm; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ All dependencies are available"

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python -m venv venv || python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the system:"
echo "1. Start the backend API:"
echo "   uvicorn app.main:app --reload"
echo ""  
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "Then visit: http://localhost:3000"
echo ""