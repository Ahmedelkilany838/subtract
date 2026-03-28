#!/bin/bash

echo "🎯 Subtract - Setup Script"
echo "=========================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔥 Firebase Setup Checklist:"
echo "----------------------------"
echo "1. ✓ Go to: https://console.firebase.google.com/project/gen-lang-client-0926721543"
echo "2. ✓ Enable Google Authentication"
echo "3. ✓ Add 'localhost' to Authorized Domains"
echo "4. ✓ Create Firestore Database"
echo "5. ✓ Set Security Rules (see FIREBASE_SETUP_GUIDE.md)"
echo ""

read -p "Have you completed Firebase setup? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    npm run dev
else
    echo ""
    echo "⚠️  Please complete Firebase setup first!"
    echo "📖 Check FIREBASE_SETUP_GUIDE.md for instructions"
fi
