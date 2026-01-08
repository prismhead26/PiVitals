#!/bin/bash

# PiVitals Deployment Script
# This script deploys updates to the PiVitals application

set -e

echo "========================================="
echo "PiVitals Deployment Script"
echo "========================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "Project directory: $PROJECT_DIR"
echo ""

# Step 1: Stop the service
echo "Step 1: Stopping PiVitals service..."
sudo systemctl stop pivitals || true
echo "Service stopped"

# Step 2: Update backend dependencies
echo ""
echo "Step 2: Updating backend..."
cd "$PROJECT_DIR/backend"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo "Backend updated"

# Step 3: Update and build frontend
echo ""
echo "Step 3: Updating frontend..."
cd "$PROJECT_DIR/frontend"
npm install
npm run build
echo "Frontend built"

# Step 4: Reload systemd configuration
echo ""
echo "Step 4: Reloading systemd configuration..."
sudo cp "$PROJECT_DIR/systemd/pivitals.service" /etc/systemd/system/
sudo systemctl daemon-reload
echo "Systemd configuration reloaded"

# Step 5: Restart the service
echo ""
echo "Step 5: Starting PiVitals service..."
sudo systemctl start pivitals
echo "Service started"

# Step 6: Check status
echo ""
echo "Step 6: Checking service status..."
sudo systemctl status pivitals --no-pager

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Service Status: $(sudo systemctl is-active pivitals)"
echo "Access PiVitals at: http://$(hostname -I | awk '{print $1}'):5001"
echo ""
echo "To view logs: sudo journalctl -u pivitals -f"
echo ""
