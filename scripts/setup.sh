#!/bin/bash

# PiVitals Setup Script
# This script sets up the PiVitals application on a Raspberry Pi

set -e

echo "========================================="
echo "PiVitals Setup Script"
echo "========================================="
echo ""

# Check if running on Raspberry Pi
if [ ! -f /proc/device-tree/model ]; then
    echo "Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "Project directory: $PROJECT_DIR"
echo ""

# Step 1: Install system dependencies
echo "Step 1: Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv nodejs npm

# Step 2: Setup backend
echo ""
echo "Step 2: Setting up backend..."
cd "$PROJECT_DIR/backend"

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "Backend dependencies installed"
deactivate

# Step 3: Setup frontend
echo ""
echo "Step 3: Setting up frontend..."
cd "$PROJECT_DIR/frontend"

# Install Node dependencies
npm install
echo "Frontend dependencies installed"

# Build frontend
echo "Building frontend..."
npm run build
echo "Frontend built successfully"

# Step 4: Create environment file
echo ""
echo "Step 4: Creating environment file..."
cd "$PROJECT_DIR"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ".env file created from template"
    echo "Please edit .env file with your configuration"
else
    echo ".env file already exists, skipping..."
fi

# Step 5: Create log directory
echo ""
echo "Step 5: Creating log directory..."
sudo mkdir -p /var/log/pivitals
sudo chown $USER:$USER /var/log/pivitals
echo "Log directory created at /var/log/pivitals"

# Step 6: Install systemd service
echo ""
echo "Step 6: Installing systemd service..."
sudo cp "$PROJECT_DIR/systemd/pivitals.service" /etc/systemd/system/
sudo systemctl daemon-reload
echo "Systemd service installed"

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file if needed: nano $PROJECT_DIR/.env"
echo "2. Enable the service: sudo systemctl enable pivitals"
echo "3. Start the service: sudo systemctl start pivitals"
echo "4. Check status: sudo systemctl status pivitals"
echo "5. View logs: sudo journalctl -u pivitals -f"
echo ""
echo "Access PiVitals at: http://$(hostname -I | awk '{print $1}'):5001"
echo ""
