#!/bin/bash

# Stop the build on any error
set -e

# Make sure we're in the script's directory (root)
BASEDIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BASEDIR"

# Build frontend
echo ">> Building frontend with npx..."
cd "$BASEDIR/frontend"
npm install
npx vite build
cd "$BASEDIR"

# Install Python dependencies from the root requirements.txt
echo ">> Installing Python dependencies from root..."
python -m pip install --upgrade pip setuptools wheel
pip install -r "$BASEDIR/requirements.txt"

echo ">> Build complete! Everything is standardized."