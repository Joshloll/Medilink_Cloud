#!/bin/bash
# setup-credentials.sh - Helper script to set up Supabase credentials securely
# Usage: ./setup-credentials.sh (on macOS/Linux)
# For Windows PowerShell: See windows-setup.ps1

set -e  # Exit on error

echo "🔐 MediLink Supabase Credentials Setup"
echo "======================================"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 1
    fi
fi

# Create .env from template
echo "Creating .env from .env.example..."
cp .env.example .env
echo "✓ .env file created"
echo ""

# Get credentials from user
echo "Enter your Supabase credentials:"
echo "(Find these at: https://app.supabase.com → Settings → API)"
echo ""

read -p "Enter Supabase Project URL: " supabase_url
read -p "Enter Supabase Anon Key: " supabase_key

# Validate inputs
if [ -z "$supabase_url" ] || [ -z "$supabase_key" ]; then
    echo "❌ Error: Credentials cannot be empty"
    exit 1
fi

# Update .env file
sed -i "" "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$supabase_url|" .env
sed -i "" "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$supabase_key|" .env

echo ""
echo "✓ Credentials updated in .env"
echo ""

# Verify .gitignore
if grep -q "^\.env$" .gitignore; then
    echo "✓ .env is properly gitignored"
else
    echo "Adding .env to .gitignore..."
    echo ".env" >> .gitignore
    echo "✓ .env added to .gitignore"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start your dev server: npm run dev"
echo "2. Check browser console for initialization message"
echo "3. Never commit .env file"
echo "4. For production, set environment variables in your hosting platform"
echo ""
echo "📚 For more info: See SECURITY_GUIDE.md"
